package com.employee.taskservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private Double estimatedHours;
    private Double loggedHours;
    private String tags;

    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SubTask> subTasks = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TaskComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TaskTimeLog> timeLogs = new ArrayList<>();

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
        if (estimatedHours == null) {
            estimatedHours = 8.0;
        }
        if (loggedHours == null) {
            loggedHours = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
