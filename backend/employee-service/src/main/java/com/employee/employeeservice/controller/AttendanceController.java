package com.employee.employeeservice.controller;

import com.employee.common.dto.ApiResponse;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AttendanceSummary>> getAttendanceSummary() {
        AttendanceSummary summary = AttendanceSummary.builder()
                .totalWorkingDays(22)
                .averageWorkingHours(8.5)
                .totalOvertimeHours(14.0)
                .attendanceComplianceRate(96.5)
                .presentDays(20)
                .absentDays(1)
                .leaveDays(1)
                .wfhDays(3)
                .build();

        return ResponseEntity.ok(new ApiResponse<>("Attendance summary calculated successfully", summary));
    }

    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getAttendanceRecords() {
        List<AttendanceRecord> records = new ArrayList<>();
        records.add(AttendanceRecord.builder()
                .id(1L)
                .date("2026-08-14")
                .clockIn("09:02 AM")
                .clockOut("06:15 PM")
                .loggedHours("9h 13m")
                .status("PRESENT")
                .locationIp("192.168.1.45 (Bangalore HQ)")
                .build());
        records.add(AttendanceRecord.builder()
                .id(2L)
                .date("2026-08-13")
                .clockIn("09:30 AM")
                .clockOut("06:30 PM")
                .loggedHours("9h 00m")
                .status("WFH")
                .locationIp("182.73.11.9 (Remote VPN)")
                .build());
        records.add(AttendanceRecord.builder()
                .id(3L)
                .date("2026-08-12")
                .clockIn("08:55 AM")
                .clockOut("05:55 PM")
                .loggedHours("9h 00m")
                .status("PRESENT")
                .locationIp("192.168.1.45 (Bangalore HQ)")
                .build());

        return ResponseEntity.ok(new ApiResponse<>("Attendance records fetched", records));
    }

    @PostMapping("/clock-in")
    public ResponseEntity<ApiResponse<ClockResponse>> clockIn() {
        ClockResponse response = ClockResponse.builder()
                .action("CLOCK_IN")
                .timestamp(LocalDateTime.now().toString())
                .status("SUCCESS")
                .message("Clocked in successfully at " + LocalDateTime.now())
                .build();

        return ResponseEntity.ok(new ApiResponse<>("Clocked in successfully", response));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<ApiResponse<ClockResponse>> clockOut() {
        ClockResponse response = ClockResponse.builder()
                .action("CLOCK_OUT")
                .timestamp(LocalDateTime.now().toString())
                .status("SUCCESS")
                .message("Clocked out successfully at " + LocalDateTime.now())
                .build();

        return ResponseEntity.ok(new ApiResponse<>("Clocked out successfully", response));
    }

    @Data
    @Builder
    public static class AttendanceSummary {
        private int totalWorkingDays;
        private double averageWorkingHours;
        private double totalOvertimeHours;
        private double attendanceComplianceRate;
        private int presentDays;
        private int absentDays;
        private int leaveDays;
        private int wfhDays;
    }

    @Data
    @Builder
    public static class AttendanceRecord {
        private Long id;
        private String date;
        private String clockIn;
        private String clockOut;
        private String loggedHours;
        private String status;
        private String locationIp;
    }

    @Data
    @Builder
    public static class ClockResponse {
        private String action;
        private String timestamp;
        private String status;
        private String message;
    }
}
