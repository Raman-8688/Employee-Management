package com.employee.taskservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_learnings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskLearning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;
    private String taskTitle;

    private Long employeeId;
    private String employeeName;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category; // TECHNICAL, ARCHITECTURE, SECURITY, PROCESS

    @Column(length = 4000, nullable = false)
    private String content;

    private String attachmentUrl;
    private String fileType;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (category == null) {
            category = "TECHNICAL";
        }
    }
}
