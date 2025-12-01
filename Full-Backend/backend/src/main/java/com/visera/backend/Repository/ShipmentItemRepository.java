package com.visera.backend.Repository;

import com.visera.backend.Entity.ShipmentItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentItemRepository extends JpaRepository<ShipmentItem, Integer> {

    List<ShipmentItem> findByShipmentId(int shipmentId);

    List<ShipmentItem> findByStatus(String status);
}
