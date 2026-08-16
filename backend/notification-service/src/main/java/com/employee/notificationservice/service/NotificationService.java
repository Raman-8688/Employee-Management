package com.employee.notificationservice.service;

import com.employee.notificationservice.entity.Notification;
import com.employee.notificationservice.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @PostConstruct
    public void seedInitialNotifications() {
        if (notificationRepository.count() == 0) {
            log.info("Seeding initial enterprise notifications into notification_db...");

            notificationRepository.save(Notification.builder()
                    .recipientId(1L)
                    .recipientEmail("admin@company.com")
                    .title("Task Assigned: Configure Spring Cloud Gateway Ingress")
                    .message("You have been assigned to Jira Issue #1: Configure Spring Cloud Gateway Ingress & Microservices Routing. High Priority.")
                    .category("TASK")
                    .priority("HIGH")
                    .status("SENT")
                    .readStatus(false)
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .sentAt(LocalDateTime.now().minusHours(2))
                    .build());

            notificationRepository.save(Notification.builder()
                    .recipientId(1L)
                    .recipientEmail("admin@company.com")
                    .title("Annual Performance Evaluation Published")
                    .message("Your Q3 AI Performance Appraisal review has been generated and published by HR leadership.")
                    .category("HR")
                    .priority("MEDIUM")
                    .status("SENT")
                    .readStatus(false)
                    .createdAt(LocalDateTime.now().minusHours(5))
                    .sentAt(LocalDateTime.now().minusHours(5))
                    .build());

            notificationRepository.save(Notification.builder()
                    .recipientId(1L)
                    .recipientEmail("admin@company.com")
                    .title("Automated Task Duration Log Completed")
                    .message("Task #4 (Fix CORS Preflight Headers) moved to DONE. 3.5 elapsed work hours automatically synchronized into ledger.")
                    .category("ALERT")
                    .priority("MEDIUM")
                    .status("SENT")
                    .readStatus(false)
                    .createdAt(LocalDateTime.now().minusHours(12))
                    .sentAt(LocalDateTime.now().minusHours(12))
                    .build());

            notificationRepository.save(Notification.builder()
                    .recipientId(1L)
                    .recipientEmail("admin@company.com")
                    .title("Eureka Microservice Health Check Passed")
                    .message("All 8 Spring Cloud microservices registered cleanly with Eureka Service Registry.")
                    .category("SYSTEM")
                    .priority("LOW")
                    .status("SENT")
                    .readStatus(true)
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .sentAt(LocalDateTime.now().minusDays(1))
                    .build());

            notificationRepository.save(Notification.builder()
                    .recipientId(1L)
                    .recipientEmail("admin@company.com")
                    .title("Failed Event Webhook Dispatch Alert")
                    .message("Simulated delivery attempt to external audit webhook failed. Automatic retry queued.")
                    .category("ALERT")
                    .priority("HIGH")
                    .status("FAILED")
                    .errorMessage("HTTP 503 Service Unavailable - Endpoint Timeout (3000ms)")
                    .readStatus(false)
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .sentAt(LocalDateTime.now().minusDays(2))
                    .build());
        }
    }

    public List<Notification> getUserNotifications(Long userId, String category, Boolean unreadOnly) {
        String cat = (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) ? category.trim().toUpperCase() : null;
        return notificationRepository.searchUserNotifications(userId, cat, unreadOnly);
    }

    public List<Notification> getRecentActivityStream() {
        return notificationRepository.findTop10ByOrderByCreatedAtDesc();
    }


    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadStatusFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));
        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public Notification dispatchNotification(Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        if (notification.getSentAt() == null) {
            notification.setSentAt(LocalDateTime.now());
        }
        if (notification.getStatus() == null) {
            notification.setStatus("SENT");
        }
        return notificationRepository.save(notification);
    }

    public Map<String, Object> getDeliveryMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        long sent = notificationRepository.countByStatus("SENT");
        long pending = notificationRepository.countByStatus("PENDING");
        long failed = notificationRepository.countByStatus("FAILED");
        long total = notificationRepository.count();

        metrics.put("sentCount", sent);
        metrics.put("pendingCount", pending);
        metrics.put("failedCount", failed);
        metrics.put("totalCount", total);
        metrics.put("deliverySuccessRate", total > 0 ? Math.round(((double) sent / total) * 100.0) : 100);
        return metrics;
    }
}
