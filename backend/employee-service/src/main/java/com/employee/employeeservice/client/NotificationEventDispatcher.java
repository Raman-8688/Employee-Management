package com.employee.employeeservice.client;

import com.employee.employeeservice.entity.Employee;
import com.employee.employeeservice.service.NotificationService;
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

    private final NotificationService notificationService;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String NOTIFICATION_DISPATCH_URL = "http://localhost:8085/api/notifications/dispatch";
    private static final String GATEWAY_FALLBACK_URL = "http://localhost:8080/api/notifications/dispatch";

    @Async
    public void dispatchEmployeeOnboardedNotification(Employee employee) {
        try {
            notificationService.createNotification(
                    "New Employee Onboarded: " + employee.getName(),
                    String.format("Welcome %s (%s)! Added to department %s. Status: %s.",
                            employee.getName(), employee.getEmail() != null ? employee.getEmail() : "No Email",
                            employee.getDepartment() != null ? employee.getDepartment() : "General",
                            employee.getStatus() != null ? employee.getStatus() : "Active"),
                    "HR",
                    "MEDIUM",
                    "ROLE_HR"
            );

            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientId", 1L);
            payload.put("recipientEmail", employee.getEmail() != null ? employee.getEmail() : "admin@company.com");
            payload.put("title", "New Employee Onboarded: " + employee.getName());
            payload.put("message", String.format("Welcome %s (%s)! Added to department %s.",
                    employee.getName(), employee.getEmail(), employee.getDepartment()));
            payload.put("category", "HR");
            payload.put("priority", "MEDIUM");
            payload.put("status", "SENT");
            payload.put("readStatus", false);
            payload.put("createdAt", LocalDateTime.now().toString());

            sendNotificationPayload(payload);
            log.info("Dispatched employee onboarded notification for {}", employee.getName());
        } catch (Exception e) {
            log.warn("Failed to dispatch employee onboarded notification: {}", e.getMessage());
        }
    }

    @Async
    public void dispatchEmployeeUpdatedNotification(Employee employee) {
        try {
            notificationService.createNotification(
                    "Employee Profile Updated: " + employee.getName(),
                    String.format("Profile details for %s updated in department %s.",
                            employee.getName(), employee.getDepartment() != null ? employee.getDepartment() : "General"),
                    "HR",
                    "LOW",
                    "ROLE_HR"
            );

            Map<String, Object> payload = new HashMap<>();
            payload.put("recipientId", employee.getId() != null ? employee.getId() : 1L);
            payload.put("recipientEmail", employee.getEmail() != null ? employee.getEmail() : "admin@company.com");
            payload.put("title", "Employee Profile Updated: " + employee.getName());
            payload.put("message", String.format("Profile details for %s updated in department %s.",
                    employee.getName(), employee.getDepartment()));
            payload.put("category", "HR");
            payload.put("priority", "LOW");
            payload.put("status", "SENT");
            payload.put("readStatus", false);
            payload.put("createdAt", LocalDateTime.now().toString());

            sendNotificationPayload(payload);
            log.info("Dispatched employee profile updated notification for {}", employee.getName());
        } catch (Exception e) {
            log.warn("Failed to dispatch employee profile update notification: {}", e.getMessage());
        }
    }

    @Async
    public void dispatchEmployeeDeletedNotification(String employeeName, String email) {
        try {
            notificationService.createNotification(
                    "Employee Record Deleted: " + employeeName,
                    String.format("Employee record for %s (%s) was removed from the HR system.", employeeName, email),
                    "ALERT",
                    "HIGH",
                    "ROLE_ADMIN"
            );
            log.info("Dispatched employee deleted notification for {}", employeeName);
        } catch (Exception e) {
            log.warn("Failed to dispatch employee deleted notification: {}", e.getMessage());
        }
    }

    private void sendNotificationPayload(Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            restTemplate.postForObject(NOTIFICATION_DISPATCH_URL, entity, String.class);
        } catch (Exception ex) {
            try {
                restTemplate.postForObject(GATEWAY_FALLBACK_URL, entity, String.class);
            } catch (Exception e) {
                // Local DB fallback handles notification retention cleanly
            }
        }
    }
}
