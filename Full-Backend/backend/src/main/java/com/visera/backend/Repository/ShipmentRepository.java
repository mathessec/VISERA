package com.visera.backend.Repository;

import com.visera.backend.Entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {

    List<Shipment> findByCreatedBy(int userId);

    List<Shipment> findByAssignedTo(int userId);

    List<Shipment> findByStatus(String status);
}

