package com.visera.backend.Service;

import com.visera.backend.Entity.Approval;
import com.visera.backend.Entity.Issue;
import com.visera.backend.Entity.Notification;
import com.visera.backend.Entity.User;
import com.visera.backend.Repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationEventService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationEventService(
            SimpMessagingTemplate messagingTemplate,
            NotificationService notificationService,
            UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public void notifyNewApproval(Approval approval) {
        try {
            // Get all supervisors
            List<User> supervisors = userRepository.findByRole("SUPERVISOR");

            // Create notification payload for WebSocket
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("id", approval.getId());
            notificationPayload.put("title", "New Approval Request");
            notificationPayload.put("message", "New verification mismatch requires approval - Request #" + approval.getId());
            notificationPayload.put("type", "ALERT");
            notificationPayload.put("category", "APPROVAL");
            notificationPayload.put("entityId", approval.getId());
            notificationPayload.put("timestamp", LocalDateTime.now().toString());
            notificationPayload.put("link", "/approvals");

            // Create database notifications for each supervisor
            for (User supervisor : supervisors) {
                Notification notification = Notification.builder()
                        .user(supervisor)
                        .title("New Approval Request")
                        .message("New verification mismatch requires approval - Request #" + approval.getId())
                        .type("ALERT")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationService.createNotification(notification);
            }

            // Publish WebSocket message to all supervisors
            messagingTemplate.convertAndSend("/topic/notifications/supervisors", notificationPayload);
        } catch (Exception e) {
            // Log error but don't fail the approval creation
            System.err.println("Failed to send approval notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void notifyNewIssue(Issue issue) {
        try {
            // Get all supervisors
            List<User> supervisors = userRepository.findByRole("SUPERVISOR");

            // Get reporter name
            String reporterName = issue.getReportedBy() != null ? issue.getReportedBy().getName() : "Unknown";

            // Create notification payload for WebSocket
            Map<String, Object> notificationPayload = new HashMap<>();
            notificationPayload.put("id", issue.getId());
            notificationPayload.put("title", "New Issue Reported");
            notificationPayload.put("message", "New issue #" + issue.getId() + " reported by " + reporterName);
            notificationPayload.put("type", "WARNING");
            notificationPayload.put("category", "ISSUE");
            notificationPayload.put("entityId", issue.getId());
            notificationPayload.put("timestamp", LocalDateTime.now().toString());
            notificationPayload.put("link", "/issues");

            // Create database notifications for each supervisor
            for (User supervisor : supervisors) {
                Notification notification = Notification.builder()
                        .user(supervisor)
                        .title("New Issue Reported")
                        .message("New issue #" + issue.getId() + " reported by " + reporterName)
                        .type("WARNING")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationService.createNotification(notification);
            }

            // Publish WebSocket message to all supervisors
            messagingTemplate.convertAndSend("/topic/notifications/supervisors", notificationPayload);
        } catch (Exception e) {
            // Log error but don't fail the issue creation
            System.err.println("Failed to send issue notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

