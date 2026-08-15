package com.employee.taskservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_time_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskTimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;

    @Column(nullable = false)
    private Double hoursSpent;

    private LocalDateTime logDate;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonIgnore
    @ToString.Exclude
    private TaskItem task;

    @PrePersist
    protected void onCreate() {
        if (logDate == null) {
            logDate = LocalDateTime.now();
        }
    }
}
