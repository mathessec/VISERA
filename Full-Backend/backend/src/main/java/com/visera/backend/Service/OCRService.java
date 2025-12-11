package com.visera.backend.Service;

import com.visera.backend.DTOs.OCRVerificationResult;
import org.springframework.web.multipart.MultipartFile;

public interface OCRService {
    OCRVerificationResult verifyPackageLabel(
        MultipartFile image,
        String expectedProductCode,
        String expectedSku,
        String expectedWeight,
        String expectedColor,
        String expectedDimensions
    );
}

