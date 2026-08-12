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

    @Column(length = 1000)
    private String description;

    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatar;
    private String department;

    private String priority; // HIGH, MEDIUM, LOW
    private String status;   // TODO, IN_PROGRESS, DONE

    private LocalDateTime dueDate;
    private LocalDateTime createdAt;

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
    }
}
