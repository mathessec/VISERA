package com.visera.backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shipment_item_id")
    private ShipmentItem shipmentItem;

    private String uploadedImageUrl;
    private String extractedSku;
    private String expectedSku;
    private Double aiConfidence;
    private String result; // MATCH / MISMATCH / LOW_CONFIDENCE

    @ManyToOne
    @JoinColumn(name = "verified_by")
    @NotNull(message = "Verifier must not be null")
    private User verifiedBy;

    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        this.verifiedAt = LocalDateTime.now();
    }
}

