package com.visera.backend.Repository;

import com.visera.backend.Entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    List<Task> findByStatus(String status);

    List<Task> findByShipmentItemId(Long shipmentItemId);
}

