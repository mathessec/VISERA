package com.visera.backend.DTOs;

import lombok.Data;

@Data
public class SkuDTO {
    private long id;
    private String skuCode;
    private String color;
    private String dimensions;
    private double weight;
    private long productId;
}

