package com.visera.backend.DTOs;

import lombok.Data;

@Data
public class VerificationDTO {
    private long shipmentItemId;
    private String extractedSku;
    private String expectedSku;
    private double aiConfidence;
    private String result;
}
