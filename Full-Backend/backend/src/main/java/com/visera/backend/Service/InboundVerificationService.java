package com.visera.backend.Service;

import com.visera.backend.DTOs.VerificationResponse;
import org.springframework.web.multipart.MultipartFile;

public interface InboundVerificationService {
    VerificationResponse verifyAndProcessInbound(
        Long shipmentItemId,
        MultipartFile image,
        Long workerId
    );
}

