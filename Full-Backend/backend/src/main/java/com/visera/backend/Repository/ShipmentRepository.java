package com.visera.backend.Repository;

import com.visera.backend.Entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByCreatedBy(Long userId);

    List<Shipment> findByAssignedTo(Long userId);

    List<Shipment> findByStatus(String status);
}

