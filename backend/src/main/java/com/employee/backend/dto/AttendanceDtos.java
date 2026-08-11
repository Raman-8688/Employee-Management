package com.employee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClockInRequest {
        private Long employeeId;
        private String ipAddress;
        private String locationTag;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClockOutRequest {
        private Long employeeId;
        private Double breakHours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverrideRequest {
        private String status;
        private LocalDateTime clockInTime;
        private LocalDateTime clockOutTime;
        private String modifiedBy;
        private String modificationReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttendanceSummaryDto {
        private int month;
        private int year;
        private int totalWorkingDays;
        private double averageWorkingHours;
        private double totalOvertimeHours;
        private double complianceRate; // e.g. 96.5%
        private long totalPresent;
        private long totalAbsent;
        private long totalWfh;
        private long totalLeave;
    }
}
