package com.visera.backend.DTOs;

import lombok.Data;

@Data
public class ShipmentItemDTO {
    private long id;
    private long shipmentId;
    private long skuId;
    private int quantity;
    private String status;
    private String skuCode;
    private String productName;
}

