package com.employee.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long attendanceId;

    @Column(nullable = false)
    private Long employeeId;

    private String employeeName;
    private String modifiedBy;
    private String modificationReason;

    private String oldStatus;
    private String newStatus;

    private LocalDateTime oldClockIn;
    private LocalDateTime newClockIn;

    private LocalDateTime oldClockOut;
    private LocalDateTime newClockOut;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
