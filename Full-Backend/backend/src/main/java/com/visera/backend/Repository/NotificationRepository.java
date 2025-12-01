package com.visera.backend.Repository;
import com.visera.backend.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserId(int userId);

    List<Notification> findByType(String type);

    List<Notification> findByIsRead(boolean isRead);
}
