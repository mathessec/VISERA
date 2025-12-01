package com.visera.backend.DTOs;

import com.visera.backend.Entity.User;
import lombok.Data;

@Data
public class ShipmentDTO {
    private long id;
    private String shipmentType;
    private String status;
    private User createdBy;
    private User assignedTo;
}

