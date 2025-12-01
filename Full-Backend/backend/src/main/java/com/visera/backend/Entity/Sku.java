package com.visera.backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skus")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sku {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @NotNull(message = "Product must not be null")
    private Product product;

    @Column(unique = true)
    @NotBlank(message = "SKU code must not be blank")
    private String skuCode;

    private Double weight;
    private String dimensions;
    private String color;
    @NotBlank(message = "imageURL must not be blank")
    private String imageUrl;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
