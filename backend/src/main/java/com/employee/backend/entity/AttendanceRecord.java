package com.employee.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    private String employeeName;
    private String department;

    @Column(nullable = false)
    private LocalDate date;

    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;

    private Double totalHours;
    private Double breakHours;
    private Double overtimeHours;

    private String status; // Present, Absent, WFH, Half-Day, Leave
    private String ipAddress;
    private String locationTag;

    @Builder.Default
    private Boolean overrideFlag = false;

    private String lastModifiedBy;
    private String overrideReason;
}
