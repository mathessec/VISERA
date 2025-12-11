package com.visera.backend.DTOs;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OCRVerificationResult {
    private String status;
    private String verificationResult;
    private String[] issues;
    private ExtractedData data;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractedData {
        private String sku;
        private String productCode;
        private String location;
        private String weight;
        private String dimensions;
        private String color;
        private String brand;
        private double confidenceScore;
        private String[] rawLines;
    }
}

