package com.employee.taskservice.client;

import com.employee.taskservice.entity.TaskItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationEventDispatcher {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String NOTIFICATION_DISPATCH_URL = "http://localhost:8085/api/notifications/dispatch";
    private static final String GATEWAY_FALLBACK_URL = "http://localhost:8080/api/notifications/dispatch";

    @Async
    public void dispatchTaskCreatedNotification(TaskItem task) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientId", task.getAssigneeId() != null ? task.getAssigneeId() : 1L);
            payload.put("recipientEmail", "admin@company.com");
            payload.put("title", "Task Created: " + task.getTitle());
            payload.put("message", String.format("Task #%d (%s) assigned to %s. Priority: %s, Status: %s.",
                    task.getId(), task.getTitle(), task.getAssigneeName() != null ? task.getAssigneeName() : "Team Member", task.getPriority(), task.getStatus()));
            payload.put("category", "TASK");
            payload.put("priority", task.getPriority() != null ? task.getPriority() : "HIGH");
            payload.put("status", "SENT");
            payload.put("readStatus", false);
            payload.put("createdAt", LocalDateTime.now().toString());

            sendNotificationPayload(payload);
            log.info("Dispatched task creation notification for task #{}", task.getId());
        } catch (Exception e) {
            log.warn("Failed to dispatch task creation event notification: {}", e.getMessage());
        }
    }

    @Async
    public void dispatchTaskStatusUpdatedNotification(TaskItem task, String oldStatus, String newStatus) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientId", task.getAssigneeId() != null ? task.getAssigneeId() : 1L);
            payload.put("recipientEmail", "admin@company.com");
            payload.put("title", "Task Status Updated: " + task.getTitle());
            payload.put("message", String.format("Task #%d status changed from %s -> %s. Assigned to %s.",
                    task.getId(), oldStatus, newStatus, task.getAssigneeName() != null ? task.getAssigneeName() : "Team Member"));
            payload.put("category", "TASK");
            payload.put("priority", "MEDIUM");
            payload.put("status", "SENT");
            payload.put("readStatus", false);
            payload.put("createdAt", LocalDateTime.now().toString());

            sendNotificationPayload(payload);
            log.info("Dispatched task status transition notification for task #{}", task.getId());
        } catch (Exception e) {
            log.warn("Failed to dispatch task status update event notification: {}", e.getMessage());
        }
    }

    private void sendNotificationPayload(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            restTemplate.postForObject(NOTIFICATION_DISPATCH_URL, entity, String.class);
        } catch (Exception ex) {
            restTemplate.postForObject(GATEWAY_FALLBACK_URL, entity, String.class);
        }
    }
}
