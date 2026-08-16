package com.employee.notificationservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.notificationservice.entity.Notification;
import com.employee.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "unreadOnly", required = false) Boolean unreadOnly
    ) {
        List<Notification> list = notificationService.getUserNotifications(userId, category, unreadOnly);
        return ResponseEntity.ok(new ApiResponse<>("User notifications fetched successfully", list));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Notification>>> getRecentActivityStream() {
        List<Notification> stream = notificationService.getRecentActivityStream();
        return ResponseEntity.ok(new ApiResponse<>("Recent activity stream fetched successfully", stream));
    }


    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable("userId") Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(new ApiResponse<>("Unread notification count fetched successfully", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable("id") Long id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>("Notification marked as read", updated));
    }

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable("userId") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new ApiResponse<>("All user notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse<>("Notification deleted successfully", null));
    }

    @PostMapping("/dispatch")
    public ResponseEntity<ApiResponse<Notification>> dispatchNotification(@RequestBody Notification notification) {
        Notification dispatched = notificationService.dispatchNotification(notification);
        return ResponseEntity.ok(new ApiResponse<>("Notification dispatched successfully", dispatched));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeliveryMetrics() {
        Map<String, Object> metrics = notificationService.getDeliveryMetrics();
        return ResponseEntity.ok(new ApiResponse<>("Notification delivery metrics fetched successfully", metrics));
    }
}
