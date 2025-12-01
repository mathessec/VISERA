package com.visera.backend.DTOs;

import lombok.Data;

@Data
public class TaskDTO {
    private long id;
    private long userId;
    private long shipmentItemId;
    private String taskType;
    private String status;
}
