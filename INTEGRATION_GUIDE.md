# Inbound Verification System - Integration Guide

## Overview

This guide provides instructions for testing and deploying the complete inbound verification system with OCR integration.

## System Architecture

```
Worker (Frontend) → Backend API → OCR Service (FastAPI)
                 ↓
            Verification Log
                 ↓
         Match? → Yes → Auto-assign to Bin
                ↓ No
         Create Approval Request
                 ↓
         Supervisor Reviews → Approve → Assign to Bin
                           → Reject → Worker notified
```

## Prerequisites

1. **Database**: MySQL running on `localhost:3306`
2. **Backend**: Spring Boot application on port `8081`
3. **Frontend**: React/Vite application on port `5173`
4. **OCR Service**: FastAPI application on port `8000`

## Installation & Setup

### 1. Database Setup

The system will automatically create the following new tables:
- `approvals` - Stores approval requests for verification mismatches
- Updated `verification_logs` - Now includes product code, weight, color, dimensions

Run the backend application to auto-create tables via Hibernate DDL.

### 2. OCR Service Setup

```bash
cd OCR
pip install -r requirements.txt
python main.py
```

The OCR service should start on `http://localhost:8000`

### 3. Backend Setup

The backend is already configured with:
- OCR service URL in `application.properties`
- New controllers: `InboundVerificationController`, `ApprovalController`
- New services: `OCRService`, `ApprovalService`, `InboundVerificationService`

Start the backend:
```bash
cd Full-Backend/backend
./mvnw spring-boot:run
```

### 4. Frontend Setup

```bash
cd FRONTEND
npm install
npm run dev
```

## Testing the Complete Flow

### Test Case 1: Successful Verification (Match)

1. **Login as Worker**
   - Navigate to "Inbound Shipment" page
   - Select an active inbound shipment

2. **Process Package**
   - Select a package from the list
   - Upload an image with a label that matches the expected values
   - Click "Verify with AI"

3. **Expected Result**
   - Verification shows "MATCH"
   - Package is auto-assigned to the default bin location
   - Package status updates to "RECEIVED"
   - Progress bar updates

### Test Case 2: Verification Mismatch

1. **Login as Worker**
   - Navigate to "Inbound Shipment" page
   - Select an active inbound shipment

2. **Process Package**
   - Select a package from the list
   - Upload an image with a label that does NOT match expected values
   - Click "Verify with AI"

3. **Expected Result**
   - Verification shows "MISMATCH"
   - Comparison table shows differences
   - Approval request is automatically created
   - Approval request ID is displayed

4. **Login as Supervisor**
   - Navigate to "Approvals" page
   - See the pending approval request

5. **Review & Approve**
   - Review the comparison details
   - Click "Approve & Assign to Bin"
   - Package is assigned to bin
   - Approval removed from pending list

### Test Case 3: Rejection Flow

1. Follow steps 1-3 from Test Case 2

2. **Login as Supervisor**
   - Navigate to "Approvals" page
   - Click "Reject" on the approval request

3. **Provide Reason**
   - Enter rejection reason in the modal
   - Click "Confirm Rejection"

4. **Expected Result**
   - Approval request is rejected
   - Removed from pending list
   - Worker can see the rejection (future enhancement)

## API Endpoints

### Inbound Verification

**Verify Package**
```
POST /api/inbound-verification/verify/{shipmentItemId}
Headers: Authorization: Bearer {token}
Body: multipart/form-data
  - image: File

Response:
{
  "status": "SUCCESS" | "MISMATCH" | "ERROR",
  "message": "...",
  "matched": true/false,
  "autoAssigned": true/false,
  "approvalRequestId": 123 (if mismatch),
  "details": {
    "extractedProductCode": "...",
    "expectedProductCode": "...",
    "extractedSku": "...",
    "expectedSku": "...",
    "extractedWeight": "...",
    "expectedWeight": "...",
    "extractedColor": "...",
    "expectedColor": "...",
    "extractedDimensions": "...",
    "expectedDimensions": "...",
    "confidence": 0.95,
    "issues": ["..."],
    "binLocation": "Zone A / Rack 1 / Bin 3"
  }
}
```

**Get Shipment Items with Locations**
```
GET /api/inbound-verification/shipment-items/{shipmentId}
Headers: Authorization: Bearer {token}

Response: Array of ShipmentItemDTO with bin location details
```

### Approvals

**Get Pending Approvals**
```
GET /api/approvals/pending
Headers: Authorization: Bearer {token}

Response: Array of ApprovalDTO
```

**Approve Request**
```
POST /api/approvals/{id}/approve
Headers: Authorization: Bearer {token}

Response: Updated Approval entity
```

**Reject Request**
```
POST /api/approvals/{id}/reject
Headers: Authorization: Bearer {token}
Body: { "reason": "..." }

Response: Updated Approval entity
```

### OCR Service

**Verify Label**
```
POST http://localhost:8000/verify-label
Body: multipart/form-data
  - file: Image file
  - expected_product_code: String (optional)
  - expected_sku: String (optional)
  - expected_weight: String (optional)
  - expected_color: String (optional)
  - expected_dimensions: String (optional)

Response:
{
  "status": "success",
  "verification_result": "MATCH" | "MISMATCH" | "NOT_VERIFIED",
  "issues": ["..."],
  "data": {
    "sku": "...",
    "product_code": "...",
    "weight": "...",
    "color": "...",
    "dimensions": "...",
    "location": "...",
    "brand": "...",
    "confidence_score": 0.95,
    "raw_lines": ["..."]
  }
}
```

## Data Flow

### Verification Process

1. **Worker uploads image** → Frontend
2. **Frontend sends to Backend** → `/api/inbound-verification/verify/{itemId}`
3. **Backend fetches expected values** → From ShipmentItem → SKU → Product
4. **Backend calls OCR service** → `/verify-label` with image + expected values
5. **OCR extracts data** → Returns extracted values + verification result
6. **Backend creates VerificationLog** → Stores all extracted and expected values
7. **Backend checks result**:
   - **MATCH**: 
     - Find SKU's default bin from InventoryStock
     - Update inventory quantity
     - Update ShipmentItem status to "RECEIVED"
     - Return success response with bin location
   - **MISMATCH**:
     - Create Approval entity
     - Return mismatch response with approval ID

### Approval Process

1. **Supervisor fetches pending approvals** → `/api/approvals/pending`
2. **Supervisor reviews details** → Extracted vs Expected comparison
3. **Supervisor approves**:
   - Update Approval status to "APPROVED"
   - Auto-assign to bin (same as match flow)
   - Update ShipmentItem status to "RECEIVED"
4. **Supervisor rejects**:
   - Update Approval status to "REJECTED"
   - Store rejection reason
   - Worker can retry verification

## Configuration

### Backend (application.properties)

```properties
# OCR Service Configuration
ocr.service.url=http://localhost:8000
```

### Frontend (environment variables)

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8081
VITE_OCR_BASE_URL=http://localhost:8000
```

## Troubleshooting

### OCR Service Not Responding

**Issue**: Backend returns "OCR service error"

**Solution**:
1. Check if OCR service is running: `curl http://localhost:8000/`
2. Check OCR service logs for errors
3. Verify `ocr.service.url` in application.properties

### No Default Bin Location

**Issue**: Verification matches but shows "no default bin location"

**Solution**:
1. Ensure SKU has an entry in `inventory_stock` table
2. Ensure the InventoryStock has a valid `bin_id`
3. Create default bin locations for all SKUs

### Authentication Issues

**Issue**: 401 Unauthorized on API calls

**Solution**:
1. Ensure JWT token is valid
2. Check user role (WORKER for verification, SUPERVISOR for approvals)
3. Verify `@PreAuthorize` annotations on controllers

### Image Upload Fails

**Issue**: Image upload returns 400 Bad Request

**Solution**:
1. Check image file size (should be < 10MB)
2. Verify image format (PNG, JPG supported)
3. Check backend multipart configuration in application.properties:
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## Performance Considerations

1. **OCR Processing Time**: First request may take 5-10 seconds (model loading). Subsequent requests are faster (~1-2 seconds).

2. **Database Queries**: The system makes multiple queries per verification:
   - Fetch ShipmentItem with SKU and Product
   - Fetch InventoryStock for bin location
   - Create VerificationLog
   - Update InventoryStock or create Approval

3. **Image Size**: Larger images take longer to process. Consider resizing images on the frontend before upload.

## Future Enhancements

1. **Worker Notifications**: Notify workers when their approval requests are reviewed
2. **Batch Verification**: Support verifying multiple packages at once
3. **Camera Integration**: Direct camera capture instead of file upload
4. **Barcode Scanning**: Integrate barcode scanner for SKU input
5. **Analytics Dashboard**: Track verification accuracy, approval rates, processing times
6. **Manual Override**: Allow supervisors to manually assign packages to bins
7. **Bin Suggestions**: AI-powered bin location suggestions based on product type
8. **Multi-language OCR**: Support labels in multiple languages

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Role-based Access**: Workers can only verify, Supervisors can approve/reject
3. **Image Validation**: Validate image file types and sizes
4. **SQL Injection**: Use parameterized queries (JPA handles this)
5. **CORS**: Configure appropriate CORS settings for production

## Deployment

### Production Checklist

- [ ] Update `ocr.service.url` to production OCR service URL
- [ ] Configure production database credentials
- [ ] Set up HTTPS for all services
- [ ] Configure appropriate CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure file upload limits
- [ ] Set up backup strategy for database
- [ ] Configure OCR service scaling (multiple instances)
- [ ] Set up CDN for image storage
- [ ] Configure rate limiting on API endpoints

## Support

For issues or questions, please contact the development team or refer to the project documentation.

