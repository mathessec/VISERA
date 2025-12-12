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
    
    @Autowired
    private com.visera.backend.Repository.ApprovalRepository approvalRepository;

    public ShipmentDTO toShipmentDTO(Shipment shipment) {
        ShipmentDTO dto = new ShipmentDTO();
        dto.setId(shipment.getId());
        dto.setShipmentType(shipment.getShipmentType());
        dto.setStatus(shipment.getStatus());
        dto.setCreatedBy(shipment.getCreatedBy());
        dto.setAssignedTo(shipment.getAssignedTo());
        dto.setDeadline(shipment.getDeadline());
        dto.setCreatedAt(shipment.getCreatedAt());

        // Assigned workers
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

        // Package count
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
        dto.setProductCode(item.getSku().getProduct().getProductCode());
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
        
        // Log identification
        dto.setId(log.getId());
        dto.setTimestamp(log.getVerifiedAt());
        
        // Employee information
        User employee = log.getVerifiedBy();
        if (employee != null) {
            dto.setEmployeeId(employee.getId());
            dto.setEmployeeName(employee.getName());
            dto.setEmployeeEmail(employee.getEmail());
        }
        
        // Shipment item and related entities
        ShipmentItem shipmentItem = log.getShipmentItem();
        dto.setShipmentItemId(shipmentItem.getId());
        
        // Operation type from shipment
        Shipment shipment = shipmentItem.getShipment();
        String operation = shipment.getShipmentType(); // INBOUND or OUTBOUND
        dto.setOperation(operation);
        
        // SKU information
        Sku sku = shipmentItem.getSku();
        if (sku != null) {
            dto.setSkuId(sku.getId());
            dto.setSkuCode(sku.getSkuCode());
            
            // Product information
            Product product = sku.getProduct();
            if (product != null) {
                dto.setProductId(product.getId());
                dto.setProductName(product.getName());
                dto.setProductCode(product.getProductCode());
            }
        }
        
        // Verification data
        dto.setExtractedSku(log.getExtractedSku());
        dto.setExpectedSku(log.getExpectedSku());
        dto.setExtractedProductCode(log.getExtractedProductCode());
        dto.setExpectedProductCode(log.getExpectedProductCode());
        dto.setExtractedWeight(log.getExtractedWeight());
        dto.setExpectedWeight(log.getExpectedWeight());
        dto.setExtractedColor(log.getExtractedColor());
        dto.setExpectedColor(log.getExpectedColor());
        dto.setExtractedDimensions(log.getExtractedDimensions());
        dto.setExpectedDimensions(log.getExpectedDimensions());
        
        // AI results
        dto.setAiConfidence(log.getAiConfidence());
        dto.setResult(log.getResult());
        
        // Determine status from approval
        List<Approval> approvals = approvalRepository.findByShipmentItemId(shipmentItem.getId());
        if (approvals != null && !approvals.isEmpty()) {
            Approval approval = approvals.get(0); // Get the most recent approval
            dto.setApprovalId(approval.getId());
            
            String approvalStatus = approval.getStatus();
            if ("PENDING".equals(approvalStatus)) {
                dto.setStatus("PENDING");
            } else if ("APPROVED".equals(approvalStatus)) {
                dto.setStatus("SUPERVISOR_APPROVED");
            } else if ("REJECTED".equals(approvalStatus)) {
                dto.setStatus("REJECTED");
            }
        } else {
            // No approval exists
            if ("MATCH".equals(log.getResult())) {
                dto.setStatus("AUTO_APPROVED");
            } else {
                dto.setStatus("PENDING");
            }
        }
        
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

