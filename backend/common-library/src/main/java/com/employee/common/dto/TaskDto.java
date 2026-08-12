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
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private String department;
    private String priority; // HIGH, MEDIUM, LOW
    private String status;   // TODO, IN_PROGRESS, DONE
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
}
