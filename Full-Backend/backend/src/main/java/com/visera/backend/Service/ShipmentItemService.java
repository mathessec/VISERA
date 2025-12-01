package com.visera.backend.Service;
import com.visera.backend.Entity.ShipmentItem;
import java.util.List;

public interface ShipmentItemService {
    ShipmentItem createShipmentItem(ShipmentItem item);
    ShipmentItem getShipmentItemById(int id);
    List<ShipmentItem> getItemsByShipment(int shipmentId);
    ShipmentItem updateShipmentItem(int id, ShipmentItem item);
    void deleteShipmentItem(int id);
}

