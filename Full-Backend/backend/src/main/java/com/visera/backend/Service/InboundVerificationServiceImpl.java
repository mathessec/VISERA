package com.visera.backend.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visera.backend.DTOs.OCRVerificationResult;
import com.visera.backend.DTOs.VerificationResponse;
import com.visera.backend.Entity.*;
import com.visera.backend.Repository.InventoryStockRepository;
import com.visera.backend.Repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
public class InboundVerificationServiceImpl implements InboundVerificationService {

    private final OCRService ocrService;
    private final VerificationLogService verificationLogService;
    private final ApprovalService approvalService;
    private final InventoryStockService inventoryStockService;
    private final ShipmentItemService shipmentItemService;
    private final UserRepository userRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ObjectMapper objectMapper;

    public InboundVerificationServiceImpl(
        OCRService ocrService,
        VerificationLogService verificationLogService,
        ApprovalService approvalService,
        InventoryStockService inventoryStockService,
        ShipmentItemService shipmentItemService,
        UserRepository userRepository,
        InventoryStockRepository inventoryStockRepository
    ) {
        this.ocrService = ocrService;
        this.verificationLogService = verificationLogService;
        this.approvalService = approvalService;
        this.inventoryStockService = inventoryStockService;
        this.shipmentItemService = shipmentItemService;
        this.userRepository = userRepository;
        this.inventoryStockRepository = inventoryStockRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @Transactional
    public VerificationResponse verifyAndProcessInbound(
        Long shipmentItemId,
        MultipartFile image,
        Long workerId
    ) {
        try {
            // 1. Get shipment item with SKU details
            ShipmentItem shipmentItem = shipmentItemService.getShipmentItemById(shipmentItemId.intValue());
            if (shipmentItem == null) {
                return buildErrorResponse("Shipment item not found");
            }

            Sku sku = shipmentItem.getSku();
            if (sku == null) {
                return buildErrorResponse("SKU not found for shipment item");
            }

            Product product = sku.getProduct();
            if (product == null) {
                return buildErrorResponse("Product not found for SKU");
            }

            User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

            // 2. Call OCR service with expected values
            OCRVerificationResult ocrResult = ocrService.verifyPackageLabel(
                image,
                product.getProductCode(),
                sku.getSkuCode(),
                sku.getWeight(),
                sku.getColor(),
                sku.getDimensions()
            );

            // 3. Create verification log
            VerificationLog log = createVerificationLog(shipmentItem, worker, ocrResult, sku, product);
            verificationLogService.createLog(log);

            // 4. Check verification result
            boolean matched = "MATCH".equals(ocrResult.getVerificationResult());

            if (matched) {
                // Auto-assign to bin
                return handleMatchedVerification(shipmentItem, sku, ocrResult);
            } else {
                // Create approval request
                return handleMismatchedVerification(shipmentItem, worker, ocrResult, sku, product);
            }

        } catch (Exception e) {
            return buildErrorResponse("Verification failed: " + e.getMessage());
        }
    }

    private VerificationLog createVerificationLog(
        ShipmentItem shipmentItem,
        User worker,
        OCRVerificationResult ocrResult,
        Sku sku,
        Product product
    ) {
        OCRVerificationResult.ExtractedData data = ocrResult.getData();
        
        // Ensure result is never null - default to MISMATCH if OCR result is null or empty
        String result = ocrResult.getVerificationResult();
        if (result == null || result.isEmpty()) {
            result = "MISMATCH"; // Treat null/empty as mismatch for reporting purposes
        }
        
        return VerificationLog.builder()
            .shipmentItem(shipmentItem)
            .verifiedBy(worker)
            .extractedSku(data != null ? data.getSku() : null)
            .expectedSku(sku.getSkuCode())
            .extractedProductCode(data != null ? data.getProductCode() : null)
            .expectedProductCode(product.getProductCode())
            .extractedWeight(data != null ? data.getWeight() : null)
            .expectedWeight(sku.getWeight())
            .extractedColor(data != null ? data.getColor() : null)
            .expectedColor(sku.getColor())
            .extractedDimensions(data != null ? data.getDimensions() : null)
            .expectedDimensions(sku.getDimensions())
            .aiConfidence(data != null ? data.getConfidenceScore() : null)
            .result(result)
            .build();
    }

    private VerificationResponse handleMatchedVerification(
        ShipmentItem shipmentItem,
        Sku sku,
        OCRVerificationResult ocrResult
    ) {
        try {
            // Find SKU's default bin location
            InventoryStock existingStock = inventoryStockRepository
                .findBySkuId(sku.getId())
                .stream()
                .findFirst()
                .orElse(null);

            String binLocation = null;
            
            if (existingStock != null && existingStock.getBin() != null) {
                Bin bin = existingStock.getBin();
                // Update existing stock
                int newQuantity = existingStock.getQuantity() + shipmentItem.getQuantity();
                inventoryStockService.updateQuantityById(existingStock.getId(), newQuantity);
                
                binLocation = formatBinLocation(bin);
            } else {
                // No default bin location found - this is an edge case
                // We'll still mark as matched but not auto-assign
                return buildMismatchResponse(
                    "Verification matched but no default bin location found for SKU. Manual assignment required.",
                    ocrResult,
                    sku,
                    null
                );
            }

            // Update shipment item status
            shipmentItem.setStatus("RECEIVED");
            shipmentItemService.updateShipmentItem(shipmentItem.getId().intValue(), shipmentItem);

            return buildSuccessResponse(ocrResult, sku, binLocation);

        } catch (Exception e) {
            return buildErrorResponse("Failed to assign to bin: " + e.getMessage());
        }
    }

    private VerificationResponse handleMismatchedVerification(
        ShipmentItem shipmentItem,
        User worker,
        OCRVerificationResult ocrResult,
        Sku sku,
        Product product
    ) {
        try {
            // Create expected data JSON
            Map<String, String> expectedData = new HashMap<>();
            expectedData.put("productCode", product.getProductCode());
            expectedData.put("skuCode", sku.getSkuCode());
            expectedData.put("weight", sku.getWeight());
            expectedData.put("color", sku.getColor());
            expectedData.put("dimensions", sku.getDimensions());
            
            String expectedDataJson = objectMapper.writeValueAsString(expectedData);

            // Create approval request
            Approval approval = approvalService.createApprovalRequest(
                shipmentItem,
                worker,
                ocrResult,
                expectedDataJson
            );

            return buildMismatchResponse(
                "Verification mismatch detected. Approval request submitted.",
                ocrResult,
                sku,
                approval.getId()
            );

        } catch (Exception e) {
            return buildErrorResponse("Failed to create approval request: " + e.getMessage());
        }
    }

    private String formatBinLocation(Bin bin) {
        Rack rack = bin.getRack();
        Zone zone = rack.getZone();
        return String.format("%s / %s / %s (%s)", 
            zone.getName(), 
            rack.getName(), 
            bin.getName(),
            bin.getCode() != null ? bin.getCode() : "");
    }

    private VerificationResponse buildSuccessResponse(
        OCRVerificationResult ocrResult,
        Sku sku,
        String binLocation
    ) {
        OCRVerificationResult.ExtractedData data = ocrResult.getData();
        
        return VerificationResponse.builder()
            .status("SUCCESS")
            .message("Verification successful. Package assigned to bin location.")
            .matched(true)
            .autoAssigned(true)
            .details(VerificationResponse.VerificationDetails.builder()
                .extractedProductCode(data.getProductCode())
                .expectedProductCode(sku.getProduct().getProductCode())
                .extractedSku(data.getSku())
                .expectedSku(sku.getSkuCode())
                .extractedWeight(data.getWeight())
                .expectedWeight(sku.getWeight())
                .extractedColor(data.getColor())
                .expectedColor(sku.getColor())
                .extractedDimensions(data.getDimensions())
                .expectedDimensions(sku.getDimensions())
                .confidence(data.getConfidenceScore())
                .issues(ocrResult.getIssues())
                .binLocation(binLocation)
                .build())
            .build();
    }

    private VerificationResponse buildMismatchResponse(
        String message,
        OCRVerificationResult ocrResult,
        Sku sku,
        Long approvalRequestId
    ) {
        OCRVerificationResult.ExtractedData data = ocrResult.getData();
        
        return VerificationResponse.builder()
            .status("MISMATCH")
            .message(message)
            .matched(false)
            .autoAssigned(false)
            .approvalRequestId(approvalRequestId)
            .details(VerificationResponse.VerificationDetails.builder()
                .extractedProductCode(data.getProductCode())
                .expectedProductCode(sku.getProduct().getProductCode())
                .extractedSku(data.getSku())
                .expectedSku(sku.getSkuCode())
                .extractedWeight(data.getWeight())
                .expectedWeight(sku.getWeight())
                .extractedColor(data.getColor())
                .expectedColor(sku.getColor())
                .extractedDimensions(data.getDimensions())
                .expectedDimensions(sku.getDimensions())
                .confidence(data.getConfidenceScore())
                .issues(ocrResult.getIssues())
                .build())
            .build();
    }

    private VerificationResponse buildErrorResponse(String message) {
        return VerificationResponse.builder()
            .status("ERROR")
            .message(message)
            .matched(false)
            .autoAssigned(false)
            .build();
    }
}




