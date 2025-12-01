package com.visera.backend.Service;
import com.visera.backend.Entity.ShipmentItem;
import com.visera.backend.Repository.ShipmentItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShipmentItemServiceImpl implements ShipmentItemService {

    private final ShipmentItemRepository repo;

    public ShipmentItemServiceImpl(ShipmentItemRepository repo) {
        this.repo = repo;
    }

    @Override
    public ShipmentItem createShipmentItem(ShipmentItem item) {
        return repo.save(item);
    }

    @Override
    public ShipmentItem getShipmentItemById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<ShipmentItem> getItemsByShipment(int shipmentId) {
        return repo.findByShipmentId(shipmentId);
    }

    @Override
    public ShipmentItem updateShipmentItem(int id, ShipmentItem updated) {
        return repo.findById(id).map(item -> {
            item.setSku(updated.getSku());
            item.setQuantity(updated.getQuantity());
            item.setStatus(updated.getStatus());
            return repo.save(item);
        }).orElse(null);
    }

    @Override
    public void deleteShipmentItem(int id) {
        repo.deleteById(id);
    }
}
