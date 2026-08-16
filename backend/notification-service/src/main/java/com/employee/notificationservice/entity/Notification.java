package com.employee.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_recipient_id", columnList = "recipient_id"),
        @Index(name = "idx_read_status", columnList = "read_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    private String recipientEmail;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false)
    private String category; // TASK, SYSTEM, HR, ALERT

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH

    @Column(nullable = false)
    private String status; // PENDING, SENT, FAILED

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "read_status", nullable = false)
    @Builder.Default
    private Boolean readStatus = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
        if (readStatus == null) {
            readStatus = false;
        }
        if (status == null) {
            status = "SENT";
        }
        if (priority == null) {
            priority = "MEDIUM";
        }
        if (category == null) {
            category = "SYSTEM";
        }
    }
}
