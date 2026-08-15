package com.employee.taskservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String taskType; // STORY, BUG, TASK, EPIC
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    private String status;   // TODO, IN_PROGRESS, IN_REVIEW, DONE

    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private String department;
    private String reporterName;

    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "TODO";
        }
        if (priority == null) {
            priority = "MEDIUM";
        }
        if (taskType == null) {
            taskType = "TASK";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
