package com.employee.employeeservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000, nullable = false)
    private String message;

    @Column(nullable = false)
    private String category; // ALL, UNREAD, TASK, HR, SYSTEM, ALERT

    private String priority; // HIGH, MEDIUM, LOW, URGENT

    private boolean read;

    private String recipientRole; // ALL, ROLE_ADMIN, ROLE_HR, ROLE_MANAGER, ROLE_EMPLOYEE

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (category == null) {
            category = "HR";
        }
        if (priority == null) {
            priority = "MEDIUM";
        }
        if (recipientRole == null) {
            recipientRole = "ALL";
        }
    }
}
