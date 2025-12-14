package com.visera.backend.Repository;

import com.visera.backend.Entity.ShipmentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ShipmentItemRepository extends JpaRepository<ShipmentItem, Long> {

    // Existing methods (unchanged)
    List<ShipmentItem> findByShipmentId(Long shipmentId);

    List<ShipmentItem> findByStatus(String status);

    List<ShipmentItem> findBySkuIdIn(List<Long> skuIds);

    List<ShipmentItem> findBySkuId(Long skuId);

    // ✅ FIXED AGENTIC CHATBOT QUERY
    @Query("""
        SELECT COUNT(si)
        FROM ShipmentItem si
        WHERE si.shipment.assignedTo.id = :workerId
        AND si.status = 'FAILED'
    """)
    long countFailedVerificationsByWorker(
            @Param("workerId") Long workerId
    );
}
