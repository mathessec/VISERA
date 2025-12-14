import uvicorn
import numpy as np
import cv2
import re
from fastapi import FastAPI, UploadFile, File, Form
from paddleocr import PaddleOCR
from PIL import Image
from io import BytesIO

app = FastAPI(title="Logistics Verification API")

# --- 1. OCR ENGINE SETUP ---
print("🚀 Initializing Logistics OCR Engine...")
ocr_engine = PaddleOCR(use_angle_cls=True, lang='en',enable_mkldnn=True,show_log=False)
print("🔥 Warming up model...")
try:
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    ocr_engine.ocr(dummy_img)
    print("✅ Engine Ready!")
except Exception as e:
    print(f"⚠️ Warmup warning: {e}")
# import time # Add this import

# # ... existing app setup ...

# print("🚀 Initializing Logistics OCR Engine...")
# # 1. Initialize Engine
# ocr_engine = PaddleOCR(use_angle_cls=False, lang='en')

# # 2. THE FIX: Force it to load NOW, not later
# print("🔥 Warming up the AI model... (This might take 10 seconds)")
# dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
# ocr_engine.ocr(dummy_img)
# print("✅ OCR Engine Ready! The first request will now be fast.")

# --- 2. PARSING LOGIC (Robust) ---
def parse_logistics_data(text_list, score_list):
    data = {
        "sku": None,
        "pid": None,
        "location": None,
        "weight": None,
        "dimensions": None,
        "brand": None,
        "color": None,
        "confidence_score": 0.0,
        "raw_lines": text_list
    }

    # --- 1. DEFINE PATTERNS ---
    # PID: Starts with P, PID, or is alphanumeric. NO SPACES allowed in the ID itself.
    pid_pattern = re.compile(r"^(P|PID|CODE)[-:\s]?[A-Z0-9-]+$", re.IGNORECASE)
    # SKU: Starts with SKU, ELEC, or matches typical SKU format
    sku_pattern = re.compile(r"^(SKU|ELEC)[-:\s]?[A-Z0-9-]+", re.IGNORECASE)

    # --- 2. CALCULATE CONFIDENCE ---
    key_scores = []
    for i, text in enumerate(text_list):
        if any(x in text.upper() for x in ["SKU", "PID", "ID:", "WEIGHT"]):
            key_scores.append(score_list[i])
    
    if key_scores:
        data["confidence_score"] = round(sum(key_scores) / len(key_scores), 2)
    else:
        data["confidence_score"] = 0.95

    # --- 3. PARSING LOGIC ---
    for i, line in enumerate(text_list):
        line_upper = line.upper().strip()
        
        # FIX: Handle OCR Typos like "Product|D" or "Product1D"
        clean_line_upper = line_upper.replace("|", "I").replace("1D", "ID")

        def is_label(txt): return ":" in txt

        # --- PID (Product ID) ---
        if not data["pid"]:
            # STRICTER Keywords: Remove generic "PRODUCT" to avoid capturing "Product: Powerbank"
            if any(x in clean_line_upper for x in ["PID", "PRODUCT ID", "PRODUCT CODE", "P-CODE", "PRODUCTID"]):
                
                parts = line.split(":")
                # Case A: Value on same line ("ProductID: PID-1804")
                if len(parts) > 1:
                    val = parts[1].strip()
                    # VALIDATION: Real PIDs usually don't have spaces (unlike "Powerbank Slim")
                    if len(val) > 1 and " " not in val: 
                        data["pid"] = val

                # Case B: Look Ahead (Next Line)
                elif i + 1 < len(text_list):
                    for offset in range(1, 4):
                        if i + offset >= len(text_list): break
                        candidate = text_list[i+offset].strip()
                        if is_label(candidate): continue
                        
                        # Match P-12 or PID-1804
                        if pid_pattern.match(candidate) or candidate.startswith("P-"):
                            data["pid"] = candidate
                            break
            
            # Fallback: strict regex match for standalone lines like "PID-1804"
            if not data["pid"] and re.match(r"^(PID|P)-[A-Z0-9]+$", line.strip()):
                data["pid"] = line.strip()

        # --- SKU ---
        if not data["sku"]:
            if "SKU" in line_upper:
                parts = line.split(":")
                if len(parts) > 1 and len(parts[1].strip()) > 3:
                    data["sku"] = parts[1].strip()
                elif i + 1 < len(text_list):
                    for offset in range(1, 4):
                        if i + offset >= len(text_list): break
                        candidate = text_list[i+offset].strip()
                        if is_label(candidate): continue
                        if candidate.startswith("P-"): continue # Skip PIDs
                        
                        if sku_pattern.match(candidate) or "SKU-" in candidate or "ELEC-" in candidate:
                            data["sku"] = candidate
                            break

        # --- COLOR ---
        if not data["color"]:
            if "COLOR" in line_upper:
                parts = line.split(":")
                if len(parts) > 1 and len(parts[1].strip()) > 0:
                    data["color"] = parts[1].strip()
                elif i + 1 < len(text_list):
                     data["color"] = text_list[i+1].strip()

        # --- WEIGHT, DIMS, LOC ---
        if not data["weight"]:
            match = re.search(r"(?i)(\d+(\.\d+)?)\s*(kg|g|lb|oz)", line)
            if match: data["weight"] = match.group(0)

        if not data["dimensions"]:
            match = re.search(r"(?i)(\d+\s*[xX]\s*\d+\s*[xX]\s*\d+)", line)
            if match: data["dimensions"] = match.group(0)

        if not data["location"]:
            # Matches "Loc: Z3-R3" or just "Z3-R3-B3"
            match = re.search(r"(?i)(LOC|Zone|Z)[-:\s]?([A-Z0-9-]+-[A-Z0-9-]+)", line)
            if match: data["location"] = match.group(0)

        # --- BRAND ---
        if "BRAND" in line_upper and not data["brand"]:
             clean_brand = re.sub(r"(?i)brand[:\s]*", "", line).strip()
             data["brand"] = clean_brand

    return data

# --- 3. UPDATED LOGIC: SMART COMPARISON FUNCTION ---
def compare_data(extracted, expected_sku, expected_pid):
    # 1. SAFETY CHECK: Did the user send anything to compare?
    if not expected_sku and not expected_pid:
        return "NOT_VERIFIED", ["No expected SKU or PID provided"]

    status = "MATCH"
    issues = []

    # Helper to clean prefixes
    def clean_input(text, prefix):
        if not text: return ""
        text = re.sub(f"(?i)^{prefix}[:\s-]*", "", text.strip())
        return text.strip()

    # 2. Compare SKU
    if expected_sku:
        clean_expected_sku = clean_input(expected_sku, "SKU")
        if not extracted["sku"]:
            status = "MISMATCH"
            issues.append("SKU not found on label")
        elif extracted["sku"].strip() != clean_expected_sku:
            status = "MISMATCH"
            issues.append(f"SKU Mismatch: Found '{extracted['sku']}', Expected '{clean_expected_sku}'")

    # 3. Compare PID
    if expected_pid:
        clean_expected_pid = clean_input(expected_pid, "PID")
        if not extracted["pid"]:
            status = "MISMATCH"
            issues.append("PID not found on label")
        elif extracted["pid"].strip() != clean_expected_pid:
            status = "MISMATCH"
            issues.append(f"PID Mismatch: Found '{extracted['pid']}', Expected '{clean_expected_pid}'")

    return status, issues
def normalize_id(text):
    if not text: return ""
    # Remove common prefixes like "PID-", "P-", "SKU-", "S-" and spaces
    text = re.sub(r"^(PID|P|SKU|S|CODE)[-:\s]*", "", text.upper())
    return text.strip()

def get_weight_in_kg(text):
    """
    Parses weight string and converts it to KILOGRAMS.
    Examples:
      "100g" -> 0.1
      "10kg" -> 10.0
      "1 lb" -> 0.45
    """
    if not text: return 0.0
    
    # Regex to capture Number and Unit
    match = re.search(r"(\d+(\.\d+)?)\s*(kg|g|lb|oz)", text, re.IGNORECASE)
    
    if not match:
        # Fallback: If no unit found, assume it matches the expected unit (return raw number)
        # But for safety, we just extract the number.
        nums = re.findall(r"\d+\.?\d*", text)
        return float(nums[0]) if nums else 0.0

    value = float(match.group(1))
    unit = match.group(3).lower()

    # CONVERSION LOGIC (Base unit: KG)
    if unit == 'g':
        return value / 1000.0  # 100g -> 0.1kg
    elif unit == 'lb' or unit == 'lbs':
        return value * 0.453592
    elif unit == 'oz':
        return value * 0.0283495
    
    # Default is kg
    return value


@app.get("/")
def home():
    return {"message": "Logistics API Online. Use POST /verify-label to test."}

# --- 4. API ENDPOINT ---
# --- HELPER: Normalize Text (Removes PID-, SKU- prefixes) ---

@app.post("/verify-label")
async def verify_label(
    expected_sku: str = Form(None),
    expected_pid: str = Form(None),
    expected_color: str = Form(None),
    expected_weight: str = Form(None),
    expected_dimensions: str = Form(None),
    file: UploadFile = File(...)
):
    """
    Main Endpoint: Uploads image, runs OCR, and verifies all fields.
    """
    # 1. Read Image
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert("RGB")
        img_array = np.array(image)
    except Exception as e:
        return {"status": "error", "message": f"Invalid image file: {e}"}
    
    # 2. Resizing Optimization (Keep text legible but faster)
    height, width = img_array.shape[:2]
    max_dim = 1024
    if width > max_dim or height > max_dim:
        scale = max_dim / float(max(width, height))
        new_width = int(width * scale)
        new_height = int(height * scale)
        img_array = cv2.resize(img_array, (new_width, new_height))

    # 3. Run OCR
    try:
        results = ocr_engine.ocr(img_array)
    except Exception as e:
        return {"status": "error", "message": f"OCR Failed: {e}"}
    
    if not results or results[0] is None:
        return {"status": "error", "message": "No text detected"}

    # 4. Extract Text
    if isinstance(results[0], list):
        texts = [line[1][0] for line in results[0]]
        scores = [line[1][1] for line in results[0]]
    else:
        texts = []
        scores = []

    # 5. Structure Data
    extracted_data = parse_logistics_data(texts, scores)

    # 6. VERIFICATION LOGIC
    verification_status = "MATCH"
    issues = []

    # A. Verify SKU
    if expected_sku:
        found = extracted_data["sku"]
        if not found:
            verification_status = "MISMATCH"
            issues.append("SKU not found on label")
        elif normalize_id(expected_sku) not in normalize_id(found):
            verification_status = "MISMATCH"
            issues.append(f"SKU Mismatch: Found '{found}', Expected '{expected_sku}'")

    # B. Verify PID
    if expected_pid:
        found = extracted_data["pid"]
        if not found:
            verification_status = "MISMATCH"
            issues.append("PID not found on label")
        elif normalize_id(expected_pid) not in normalize_id(found):
            verification_status = "MISMATCH"
            issues.append(f"PID Mismatch: Found '{found}', Expected '{expected_pid}'")

    # C. Verify Color
    if expected_color:
        found = extracted_data["color"]
        if not found:
            verification_status = "MISMATCH"
            issues.append("Color not found on label")
        elif expected_color.upper() not in found.upper():
            verification_status = "MISMATCH"
            issues.append(f"Color Mismatch: Found '{found}', Expected '{expected_color}'")

    # D. Verify Weight (Numeric w/ Unit Conversion)
    if expected_weight:
        found = extracted_data["weight"]
        if not found:
            verification_status = "MISMATCH"
            issues.append("Weight not found on label")
        else:
            val_found = get_weight_in_kg(found)
            val_expected = get_weight_in_kg(expected_weight)
            
            # Tolerance 0.02kg (to handle rounding errors)
            if abs(val_found - val_expected) > 0.02:
                verification_status = "MISMATCH"
                issues.append(f"Weight Mismatch: Found '{found}' ({val_found:.2f}kg), Expected '{expected_weight}' ({val_expected:.2f}kg)")

    # E. Verify Dimensions
    if expected_dimensions:
        found = extracted_data["dimensions"]
        if not found:
            verification_status = "MISMATCH"
            issues.append("Dimensions not found on label")
        else:
            # 1. Clean Extraction: "20 x 15 x 10" -> "20X15X10"
            clean_found = found.replace(" ", "").upper()
            
            # 2. Clean Expectation: "20x15x10cm" -> "20X15X10"
            # Regex removes anything that isn't a digit or 'X'
            clean_exp = re.sub(r"[^0-9X]", "", expected_dimensions.upper())
            
            # 3. Compare (Check if the numbers match)
            if clean_exp not in clean_found:
                 verification_status = "MISMATCH"
                 issues.append(f"Dimensions Mismatch: Found '{found}', Expected '{expected_dimensions}'")

    return {
        "status": "success",
        "verification_result": verification_status,
        "issues": issues,
        "data": extracted_data
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)