package com.employee.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    private Long id;
    private String title;
    private String message;
    private String category; // ALL, UNREAD, TASK, HR, SYSTEM, ALERT
    private String priority; // HIGH, MEDIUM, LOW, URGENT
    private boolean read;
    private String recipientRole; // ROLE_ADMIN, ROLE_HR, ROLE_MANAGER, ROLE_EMPLOYEE, ALL
    private String createdAt;
}
