package com.visera.backend.DTOs;

import lombok.Data;

@Data
public class UserDTO {
    private long id;
    private String name;
    private String email;
    private String role;
}

