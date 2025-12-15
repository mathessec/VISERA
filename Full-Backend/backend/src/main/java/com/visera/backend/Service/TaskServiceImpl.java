package com.visera.backend.Service;
import com.visera.backend.DTOs.BinAllocation;
import com.visera.backend.DTOs.PutawayStatisticsDTO;
import com.visera.backend.DTOs.RecentCompletionDTO;
import com.visera.backend.Entity.*;
import com.visera.backend.Repository.BinRepository;
import com.visera.backend.Repository.InventoryStockRepository;
import com.visera.backend.Repository.TaskRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository repo;
    private final InventoryStockService inventoryStockService;
    private final InventoryStockRepository inventoryStockRepository;
    private final BinRepository binRepository;
    private final ShipmentItemService shipmentItemService;
    private final ObjectMapper objectMapper;

    public TaskServiceImpl(
            TaskRepository repo,
            InventoryStockService inventoryStockService,
            InventoryStockRepository inventoryStockRepository,
            BinRepository binRepository,
            ShipmentItemService shipmentItemService) {
        this.repo = repo;
        this.inventoryStockService = inventoryStockService;
        this.inventoryStockRepository = inventoryStockRepository;
        this.binRepository = binRepository;
        this.shipmentItemService = shipmentItemService;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public Task createTask(Task task) {
        return repo.save(task);
    }

    @Override
    public List<Task> getTasksByUser(int userId) {
        return repo.findByUserId((long) userId);
    }

    @Override
    public Task updateTaskStatus(int id, String status) {
        return repo.findById((long) id).map(task -> {
            task.setStatus(status);
            return repo.save(task);
        }).orElse(null);
    }

    @Override
    public List<Task> getPutawayTasksByUser(int userId) {
        // Only return PUTAWAY tasks for INBOUND shipments
        return repo.findPutawayTasksByUserForInbound((long) userId, "PUTAWAY", "COMPLETED");
    }

    @Override
    public Task startPutaway(Long taskId) {
        return repo.findById(taskId).map(task -> {
            task.setInProgress(true);
            task.setStatus("IN_PROGRESS");
            return repo.save(task);
        }).orElse(null);
    }

    @Override
    public List<Task> getCompletedPutawayTasksToday(int userId) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        // Only return completed PUTAWAY tasks for INBOUND shipments
        return repo.findCompletedPutawayTasksTodayForInbound(
                (long) userId, "PUTAWAY", "COMPLETED", startOfDay);
    }

    @Override
    public PutawayStatisticsDTO getPutawayStatistics(int userId) {
        // Only count PUTAWAY tasks for INBOUND shipments
        long pendingCount = repo.countPutawayTasksByUserAndStatusForInbound((long) userId, "PUTAWAY", "PENDING");
        long inProgressCount = repo.countPutawayTasksByUserAndStatusForInbound((long) userId, "PUTAWAY", "IN_PROGRESS");
        
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        List<Task> completedToday = repo.findCompletedPutawayTasksTodayForInbound(
                (long) userId, "PUTAWAY", "COMPLETED", startOfDay);
        long completedTodayCount = completedToday.size();
        
        // Total = pending + in progress (exclude completed)
        long totalCount = pendingCount + inProgressCount;

        return PutawayStatisticsDTO.builder()
                .pendingCount((int) pendingCount)
                .inProgressCount((int) inProgressCount)
                .completedTodayCount((int) completedTodayCount)
                .totalItemsCount((int) totalCount)
                .build();
    }

    @Override
    @Transactional
    public Task completePutaway(Long taskId, Long binId, Integer quantity) {
        return repo.findById(taskId).map(task -> {
            Bin bin = binRepository.findById(binId)
                    .orElseThrow(() -> new RuntimeException("Bin not found"));
            Sku sku = task.getShipmentItem().getSku();

            // Create or update inventory stock
            inventoryStockService.updateStock(
                    sku.getId().intValue(),
                    binId.intValue(),
                    quantity
            );

            // Update task status
            task.setStatus("COMPLETED");
            task.setInProgress(false);
            task.setCompletedAt(LocalDateTime.now());
            Task savedTask = repo.save(task);

            // Update shipment item status
            ShipmentItem shipmentItem = task.getShipmentItem();
            shipmentItem.setStatus("RECEIVED");
            shipmentItemService.updateShipmentItem(shipmentItem.getId().intValue(), shipmentItem);
            
            return savedTask;
        }).orElse(null);
    }

    @Override
    @Transactional
    public Task completePutawayWithAllocation(Long taskId, List<BinAllocation> allocations) {
        return repo.findById(taskId).map(task -> {
            Sku sku = task.getShipmentItem().getSku();

            // Create/update inventory stock for each bin allocation
            for (BinAllocation allocation : allocations) {
                inventoryStockService.updateStock(
                        sku.getId().intValue(),
                        allocation.getBinId().intValue(),
                        allocation.getQuantity()
                );
            }

            // Update task status
            task.setStatus("COMPLETED");
            task.setInProgress(false);
            task.setCompletedAt(LocalDateTime.now());
            Task savedTask = repo.save(task);

            // Update shipment item status
            ShipmentItem shipmentItem = task.getShipmentItem();
            shipmentItem.setStatus("RECEIVED");
            shipmentItemService.updateShipmentItem(shipmentItem.getId().intValue(), shipmentItem);
            
            return savedTask;
        }).orElse(null);
    }
}
