package com.visera.backend.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visera.backend.DTOs.OCRVerificationResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class OCRServiceImpl implements OCRService {

    @Value("${ocr.service.url:http://localhost:8000}")
    private String ocrServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OCRServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public OCRVerificationResult verifyPackageLabel(
        MultipartFile image,
        String expectedProductCode,
        String expectedSku,
        String expectedWeight,
        String expectedColor,
        String expectedDimensions
    ) {
        try {
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Add image file
            ByteArrayResource fileResource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };
            body.add("file", fileResource);
            
            // Add expected values
            if (expectedProductCode != null) body.add("expected_product_code", expectedProductCode);
            if (expectedSku != null) body.add("expected_sku", expectedSku);
            if (expectedWeight != null) body.add("expected_weight", expectedWeight);
            if (expectedColor != null) body.add("expected_color", expectedColor);
            if (expectedDimensions != null) body.add("expected_dimensions", expectedDimensions);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Call OCR service
            ResponseEntity<String> response = restTemplate.exchange(
                ocrServiceUrl + "/verify-label",
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            // Parse response
            return objectMapper.readValue(response.getBody(), OCRVerificationResult.class);

        } catch (Exception e) {
            // Return error result
            return OCRVerificationResult.builder()
                .status("error")
                .verificationResult("ERROR")
                .issues(new String[]{"OCR service error: " + e.getMessage()})
                .data(OCRVerificationResult.ExtractedData.builder()
                    .confidenceScore(0.0)
                    .build())
                .build();
        }
    }
}

