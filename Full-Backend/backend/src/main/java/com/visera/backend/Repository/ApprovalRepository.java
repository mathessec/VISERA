package com.visera.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.visera.backend.Entity.Approval;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByStatus(String status);
    List<Approval> findByRequestedById(Long userId);
    List<Approval> findByShipmentItemId(Long shipmentItemId);
}






