package com.visera.backend.Repository;

import com.visera.backend.Entity.VerificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationLogRepository extends JpaRepository<VerificationLog, Integer> {

    List<VerificationLog> findByShipmentItemId(int shipmentItemId);

    List<VerificationLog> findByVerifiedBy(int userId);
}

