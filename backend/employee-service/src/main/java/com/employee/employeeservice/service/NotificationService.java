package com.employee.employeeservice.service;

import com.employee.employeeservice.entity.Notification;
import com.employee.employeeservice.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @PostConstruct
    public void initSeedNotifications() {
        if (notificationRepository.count() == 0) {
            log.info("Seeding initial enterprise notification records into emp_db...");

            notificationRepository.save(Notification.builder()
                    .title("Employee Onboarding Audit")
                    .message("New employee profile created: Enterprise Admin registered in HR directory.")
                    .category("HR")
                    .priority("HIGH")
                    .read(false)
                    .recipientRole("ROLE_HR")
                    .createdAt(LocalDateTime.now().minusHours(1))
                    .build());

            notificationRepository.save(Notification.builder()
                    .title("Task Assignment Alert")
                    .message("Jira Task #1 'Configure Spring Cloud Gateway Ingress' moved to DONE.")
                    .category("TASK")
                    .priority("MEDIUM")
                    .read(false)
                    .recipientRole("ALL")
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .build());

            notificationRepository.save(Notification.builder()
                    .title("System Maintenance Notice")
                    .message("Eureka Service Registry self-preservation mode disabled for high availability.")
                    .category("SYSTEM")
                    .priority("LOW")
                    .read(true)
                    .recipientRole("ROLE_ADMIN")
                    .createdAt(LocalDateTime.now().minusHours(5))
                    .build());

            notificationRepository.save(Notification.builder()
                    .title("Critical Security Alert")
                    .message("JWT Bearer token rotation policy updated across all microservices.")
                    .category("ALERT")
                    .priority("URGENT")
                    .read(false)
                    .recipientRole("ROLE_ADMIN")
                    .createdAt(LocalDateTime.now().minusMinutes(30))
                    .build());
        }
    }

    public Notification createNotification(String title, String message, String category, String priority, String recipientRole) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .category(category != null ? category.toUpperCase() : "HR")
                .priority(priority != null ? priority.toUpperCase() : "MEDIUM")
                .recipientRole(recipientRole != null ? recipientRole : "ALL")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getNotificationsByCategory(String category) {
        if ("ALL".equalsIgnoreCase(category)) {
            return getAllNotifications();
        } else if ("UNREAD".equalsIgnoreCase(category)) {
            return notificationRepository.findByReadFalseOrderByCreatedAtDesc();
        }
        return notificationRepository.findByCategoryOrderByCreatedAtDesc(category.toUpperCase());
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
