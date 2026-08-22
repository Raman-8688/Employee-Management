package com.employee.employeeservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.employeeservice.entity.Notification;
import com.employee.employeeservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(value = "category", required = false, defaultValue = "ALL") String category) {
        List<Notification> notifications = notificationService.getNotificationsByCategory(category);
        return ResponseEntity.ok(new ApiResponse<>("Notifications fetched successfully", notifications));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.createNotification(
                notification.getTitle(),
                notification.getMessage(),
                notification.getCategory(),
                notification.getPriority(),
                notification.getRecipientRole()
        );
        return ResponseEntity.ok(new ApiResponse<>("Notification created successfully", saved));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable("id") Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>("Notification marked as read", updated));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(new ApiResponse<>("All notifications marked as read", null));
    }
}
