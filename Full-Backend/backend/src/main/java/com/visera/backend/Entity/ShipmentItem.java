package com.visera.backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "shipment_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shipment_id")
    @NotNull(message = "Shipment must not be null")
    private Shipment shipment;

    @ManyToOne
    @JoinColumn(name = "sku_id")
    @NotNull(message = "SKU must not be null")
    private Sku sku;

    @NotBlank(message = "quantity must not be blank")
    private Integer quantity;

    private String status; // RECEIVED, STORED, PICKED, PACKED
}

