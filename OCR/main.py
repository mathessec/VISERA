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
    """
    Converts raw OCR text lines into structured JSON using Regex.
    """
    data = {
        "sku": None,
        "product_code": None,
        "location": None,
        "weight": None,
        "dimensions": None,
        "color": None,
        "brand": None,
        "confidence_score": 0.0,
        "raw_lines": text_list
    }
    key_scores = []
    
    for i, text in enumerate(text_list):
        current_score = score_list[i] # The score for this specific line
        
        # If this line contains the SKU, keep its score
        if "SKU" in text.upper():
            key_scores.append(current_score)
            
        # If this line contains the Product Code, keep its score
        elif "PROD" in text.upper() or "PRODUCT" in text.upper():
            key_scores.append(current_score)
            
    # Calculate score ONLY based on important fields
    if key_scores:
        data["confidence_score"] = round(sum(key_scores) / len(key_scores), 2)
    else:
        # Fallback: if no keys found, use overall average (or 0.0)
        data["confidence_score"] = round(sum(score_list) / len(score_list), 2)

    # # Calculate average confidence
    # if score_list:
    #     data["confidence_score"] = round(sum(score_list) / len(score_list), 2)

    # Regex Patterns (Updated for inbound verification)
    patterns = {
        "sku": r"(?i)SKU[:\s-]*([A-Z0-9-]+)", 
        "product_code": r"(?i)(PROD|PRODUCT)[:\s-]*([A-Z0-9-]+)", 
        "loc": r"(?i)(LOC|Zone|Z)[-:\s]?([A-Z0-9-]+)", 
        "weight": r"(?i)(\d+(\.\d+)?\s*(kg|g|lbs))", 
        "dims": r"(?i)(\d+\s*[xX]\s*\d+\s*[xX]\s*\d+)",
        "color": r"(?i)(COLOR|COLOUR)[:\s-]*([A-Za-z\s]+)",
    }

    for text in text_list:
        # Check SKU
        if not data["sku"]:
            match = re.search(patterns["sku"], text)
            if match: data["sku"] = match.group(1)
        
        # Check Product Code
        if not data["product_code"]:
            match = re.search(patterns["product_code"], text)
            if match: data["product_code"] = match.group(2)
            
        # Check Location
        if not data["location"]:
            match = re.search(patterns["loc"], text)
            if match: data["location"] = match.group(0) 

        # Check Weight
        if not data["weight"]:
            match = re.search(patterns["weight"], text)
            if match: data["weight"] = match.group(0)

        # Check Dimensions
        if not data["dimensions"]:
            match = re.search(patterns["dims"], text)
            if match: data["dimensions"] = match.group(0)
        
        # Check Color
        if not data["color"]:
            match = re.search(patterns["color"], text)
            if match: data["color"] = match.group(2).strip()
            
        # Check Brand (Improved Case Handling)
        if "BRAND" in text.upper():
            clean_brand = re.sub(r"(?i)brand[:\s]*", "", text).strip()
            data["brand"] = clean_brand

    return data

# --- 3. UPDATED LOGIC: SMART COMPARISON FUNCTION ---
def compare_data(extracted, expected_product_code, expected_sku, expected_weight, expected_color, expected_dimensions):
    # 1. SAFETY CHECK: Did the user send anything to compare?
    if not any([expected_product_code, expected_sku, expected_weight, expected_color, expected_dimensions]):
        return "NOT_VERIFIED", ["No expected values provided"]

    status = "MATCH"
    issues = []

    # Helper to clean prefixes and normalize
    def clean_input(text, prefix=""):
        if not text: return ""
        text = re.sub(f"(?i)^{prefix}[:\s-]*", "", text.strip())
        return text.strip().upper()
    
    def normalize_weight(weight):
        if not weight: return ""
        # Normalize weight format (e.g., "2.5kg" or "2.5 kg")
        return re.sub(r'\s+', '', weight.upper())
    
    def normalize_dimensions(dims):
        if not dims: return ""
        # Normalize dimensions (e.g., "10x20x30" or "10 x 20 x 30")
        return re.sub(r'\s+', '', dims.upper())

    # 2. Compare Product Code
    if expected_product_code:
        clean_expected = clean_input(expected_product_code, "PROD|PRODUCT")
        extracted_code = clean_input(extracted.get("product_code", ""))
        if not extracted_code:
            status = "MISMATCH"
            issues.append("Product Code not found on label")
        elif extracted_code != clean_expected:
            status = "MISMATCH"
            issues.append(f"Product Code Mismatch: Found '{extracted.get('product_code')}', Expected '{expected_product_code}'")

    # 3. Compare SKU
    if expected_sku:
        clean_expected_sku = clean_input(expected_sku, "SKU")
        extracted_sku = clean_input(extracted.get("sku", ""))
        if not extracted_sku:
            status = "MISMATCH"
            issues.append("SKU not found on label")
        elif extracted_sku != clean_expected_sku:
            status = "MISMATCH"
            issues.append(f"SKU Mismatch: Found '{extracted.get('sku')}', Expected '{expected_sku}'")

    # 4. Compare Weight
    if expected_weight:
        normalized_expected = normalize_weight(expected_weight)
        normalized_extracted = normalize_weight(extracted.get("weight", ""))
        if not normalized_extracted:
            status = "MISMATCH"
            issues.append("Weight not found on label")
        elif normalized_extracted != normalized_expected:
            status = "MISMATCH"
            issues.append(f"Weight Mismatch: Found '{extracted.get('weight')}', Expected '{expected_weight}'")

    # 5. Compare Color
    if expected_color:
        clean_expected_color = clean_input(expected_color, "COLOR|COLOUR")
        extracted_color = clean_input(extracted.get("color", ""))
        if not extracted_color:
            status = "MISMATCH"
            issues.append("Color not found on label")
        elif extracted_color != clean_expected_color:
            status = "MISMATCH"
            issues.append(f"Color Mismatch: Found '{extracted.get('color')}', Expected '{expected_color}'")

    # 6. Compare Dimensions
    if expected_dimensions:
        normalized_expected_dims = normalize_dimensions(expected_dimensions)
        normalized_extracted_dims = normalize_dimensions(extracted.get("dimensions", ""))
        if not normalized_extracted_dims:
            status = "MISMATCH"
            issues.append("Dimensions not found on label")
        elif normalized_extracted_dims != normalized_expected_dims:
            status = "MISMATCH"
            issues.append(f"Dimensions Mismatch: Found '{extracted.get('dimensions')}', Expected '{expected_dimensions}'")

    return status, issues

@app.get("/")
def home():
    return {"message": "Logistics API Online. Use POST /verify-label to test."}

# --- 4. API ENDPOINT ---
@app.post("/verify-label")
async def verify_label(
    expected_product_code: str = Form(None),
    expected_sku: str = Form(None),
    expected_weight: str = Form(None),
    expected_color: str = Form(None),
    expected_dimensions: str = Form(None),
    file: UploadFile = File(...)
):
    # start_total = time.time()
    
    # # Step 1: Read Image
    # t1 = time.time()
    # image_data = await file.read()
    # image = Image.open(BytesIO(image_data)).convert("RGB")
    # img_array = np.array(image)
    # print(f"⏱️ Image Read Time: {round(time.time() - t1, 2)}s")

    # # Step 2: OCR Execution (The usual suspect)
    # t2 = time.time()
    # print("⏳ Starting OCR scan...")
    # results = ocr_engine.ocr(img_array)
    # print(f"⏱️ OCR Scan Time: {round(time.time() - t2, 2)}s") # <--- LOOK AT THIS NUMBER IN LOGS

    # # ... rest of logic ...
    
    # print(f"✅ Total Request Time: {round(time.time() - start_total, 2)}s")
    """
    Uploads image AND accepts expected SKU/PID to verify match.
    """
    # 1. Read Image
    try:
        image_data = await file.read()
        image = Image.open(BytesIO(image_data)).convert("RGB")
        img_array = np.array(image)
    except Exception as e:
        return {"status": "error", "message": f"Invalid image file: {e}"}
    
    # 2. Run OCR
    results = ocr_engine.ocr(img_array)
    
    if not results:
        return {"status": "error", "message": "No text detected"}

    # 3. Extract Text (RESTORED ROBUST LOGIC)
    # This block was missing in the previous attempt!
    if isinstance(results[0], dict):
        texts = results[0].get('rec_texts', [])
        scores = results[0].get('rec_scores', [])
    elif isinstance(results[0], list):
        texts = [line[1][0] for line in results[0]]
        scores = [line[1][1] for line in results[0]]
    else:
        texts = []
        scores = []

    # 4. Structure the Data
    extracted_data = parse_logistics_data(texts, scores)

    # 5. Verify Match
    verification_status, issues = compare_data(
        extracted_data, 
        expected_product_code, 
        expected_sku, 
        expected_weight, 
        expected_color, 
        expected_dimensions
    )
    
    return {
        "status": "success",
        "verification_result": verification_status,
        "issues": issues,
        "data": extracted_data
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)