package com.visera.backend.DTOs;

import lombok.Data;

@Data
public class ProductDTO {
    private long id;
    private String name;
    private String description;
    private String category;
    private String imageUrl;
}

