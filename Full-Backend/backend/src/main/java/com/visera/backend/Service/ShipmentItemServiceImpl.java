package com.visera.backend.Service;
import com.visera.backend.Entity.Shipment;
import com.visera.backend.Entity.ShipmentItem;
import com.visera.backend.Entity.ShipmentWorker;
import com.visera.backend.Entity.User;
import com.visera.backend.Repository.ShipmentItemRepository;
import com.visera.backend.Repository.ShipmentWorkerRepository;
import com.visera.backend.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentItemServiceImpl implements ShipmentItemService {

    private final ShipmentItemRepository repo;
    private final ShipmentWorkerRepository shipmentWorkerRepository;
    private final UserRepository userRepository;

    public ShipmentItemServiceImpl(
            ShipmentItemRepository repo,
            ShipmentWorkerRepository shipmentWorkerRepository,
            UserRepository userRepository
    ) {
        this.repo = repo;
        this.shipmentWorkerRepository = shipmentWorkerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ShipmentItem createShipmentItem(ShipmentItem item) {
        return repo.save(item);
    }

    @Override
    public List<ShipmentItem> createBatchShipmentItems(List<ShipmentItem> items) {
        return repo.saveAll(items);
    }

    @Override
    public ShipmentItem getShipmentItemById(int id) {
        return repo.findById((long) id).orElse(null);
    }

    @Override
    public List<ShipmentItem> getItemsByShipment(int shipmentId) {
        return repo.findByShipmentId((long) shipmentId);
    }

    @Override
    public ShipmentItem updateShipmentItem(int id, ShipmentItem updated) {
        return repo.findById((long) id).map(item -> {
            item.setSku(updated.getSku());
            item.setQuantity(updated.getQuantity());
            item.setStatus(updated.getStatus());
            return repo.save(item);
        }).orElse(null);
    }

    @Override
    public void deleteShipmentItem(int id) {
        repo.deleteById((long) id);
    }

    @Override
    public List<ShipmentItem> getItemsByAssignedWorker(Long workerId) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + workerId));
        
        // Get all shipments assigned to this worker
        List<ShipmentWorker> assignments = shipmentWorkerRepository.findByWorker(worker);
        
        System.out.println("=== DEBUG: getItemsByAssignedWorker ===");
        System.out.println("Worker ID: " + workerId + ", Worker Email: " + worker.getEmail());
        System.out.println("Found " + assignments.size() + " assigned shipments");
        
        if (assignments.isEmpty()) {
            System.out.println("No assignments found for worker");
            return new ArrayList<>(); // Return empty list if no assignments
        }
        
        // Get all shipment items from assigned shipments
        List<ShipmentItem> allItems = new ArrayList<>();
        for (ShipmentWorker assignment : assignments) {
            Shipment shipment = assignment.getShipment();
            if (shipment != null) {
                Long shipmentId = shipment.getId();
                System.out.println("Processing Shipment ID: " + shipmentId + ", Type: " + shipment.getShipmentType() + ", Status: " + shipment.getStatus());
                
                List<ShipmentItem> items = repo.findByShipmentId(shipmentId);
                System.out.println("  -> Found " + (items != null ? items.size() : 0) + " shipment items");
                
                if (items != null && !items.isEmpty()) {
                    allItems.addAll(items);
                    // Log first item details for debugging
                    ShipmentItem firstItem = items.get(0);
                    System.out.println("  -> First item ID: " + firstItem.getId() + ", SKU: " + (firstItem.getSku() != null ? firstItem.getSku().getSkuCode() : "null"));
                } else {
                    System.out.println("  -> WARNING: Shipment has no items!");
                }
            } else {
                System.out.println("  -> WARNING: Assignment has null shipment!");
            }
        }
        
        System.out.println("Total items found: " + allItems.size());
        System.out.println("=== END DEBUG ===");
        return allItems;
    }
}
