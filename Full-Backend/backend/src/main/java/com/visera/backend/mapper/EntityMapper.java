package com.visera.backend.mapper;

import com.visera.backend.DTOs.*;
import com.visera.backend.Entity.*;
import com.visera.backend.Repository.ShipmentItemRepository;
import com.visera.backend.Repository.ShipmentWorkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    @Autowired
    private ShipmentWorkerRepository shipmentWorkerRepository;

    @Autowired
    private ShipmentItemRepository shipmentItemRepository;

    public ShipmentDTO toShipmentDTO(Shipment shipment) {
        ShipmentDTO dto = new ShipmentDTO();
        dto.setId(shipment.getId());
        dto.setShipmentType(shipment.getShipmentType());
        dto.setStatus(shipment.getStatus());
        dto.setCreatedBy(shipment.getCreatedBy());
        dto.setAssignedTo(shipment.getAssignedTo());
        dto.setDeadline(shipment.getDeadline());
        dto.setCreatedAt(shipment.getCreatedAt());
        
        // Get assigned workers
        List<ShipmentWorker> shipmentWorkers = shipmentWorkerRepository.findByShipment(shipment);
        List<UserDTO> assignedWorkers = shipmentWorkers.stream()
                .map(sw -> {
                    UserDTO userDTO = new UserDTO();
                    userDTO.setId(sw.getWorker().getId());
                    userDTO.setName(sw.getWorker().getName());
                    userDTO.setEmail(sw.getWorker().getEmail());
                    userDTO.setRole(sw.getWorker().getRole());
                    return userDTO;
                })
                .collect(Collectors.toList());
        dto.setAssignedWorkers(assignedWorkers);
        
        // Get package count
        int packageCount = shipmentItemRepository.findByShipmentId(shipment.getId()).size();
        dto.setPackageCount(packageCount);
        
        return dto;
    }

    public ShipmentItemDTO toShipmentItemDTO(ShipmentItem item) {
        ShipmentItemDTO dto = new ShipmentItemDTO();
        dto.setId(item.getId());
        dto.setShipmentId(item.getShipment().getId());
        dto.setSkuId(item.getSku().getId());
        dto.setQuantity(item.getQuantity());
        dto.setStatus(item.getStatus());
        dto.setSkuCode(item.getSku().getSkuCode());
        dto.setProductName(item.getSku().getProduct().getName());
        return dto;
    }

    public TaskDTO toTaskDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setUserId(task.getUser().getId());
        dto.setShipmentItemId(task.getShipmentItem().getId());
        dto.setTaskType(task.getTaskType());
        dto.setStatus(task.getStatus());
        return dto;
    }

    public NotificationDTO toNotificationDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setUserId(n.getUser().getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRead(n.isRead());
        return dto;
    }

    public VerificationDTO toVerificationDTO(VerificationLog log) {
        VerificationDTO dto = new VerificationDTO();
        dto.setShipmentItemId(log.getShipmentItem().getId());
        dto.setExtractedSku(log.getExtractedSku());
        dto.setExpectedSku(log.getExpectedSku());
        dto.setAiConfidence(log.getAiConfidence());
        dto.setResult(log.getResult());
        return dto;
    }

    public SkuDTO toSkuDTO(Sku sku) {
        SkuDTO dto = new SkuDTO();
        dto.setId(sku.getId());
        dto.setSkuCode(sku.getSkuCode());
        dto.setColor(sku.getColor());
        dto.setDimensions(sku.getDimensions());
        dto.setWeight(sku.getWeight());
        dto.setProductId(sku.getProduct().getId());
        return dto;
    }
}

