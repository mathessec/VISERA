package com.visera.backend.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @NotNull(message = "User must not be null")
    private User user;

    @ManyToOne
    @JoinColumn(name = "shipment_item_id")
    @NotNull(message = "ShipmentItem must not be null")
    private ShipmentItem shipmentItem;

    private String taskType; // PUTAWAY / PICKING
    private String status;   // PENDING / COMPLETED

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
