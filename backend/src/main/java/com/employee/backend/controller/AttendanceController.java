package com.employee.backend.controller;

import com.employee.backend.dto.ApiResponse;
import com.employee.backend.dto.AttendanceDtos;
import com.employee.backend.entity.AttendanceAuditLog;
import com.employee.backend.entity.AttendanceRecord;
import com.employee.backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<AttendanceDtos.AttendanceSummaryDto>> getMonthlySummary(
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year) {
        
        int currentMonth = month != null ? month : LocalDate.now().getMonthValue();
        int currentYear = year != null ? year : LocalDate.now().getYear();

        AttendanceDtos.AttendanceSummaryDto summary = attendanceService.getMonthlySummary(currentMonth, currentYear);
        return ResponseEntity.ok(new ApiResponse<>("Attendance monthly summary fetched successfully", summary));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getEmployeeAttendance(
            @PathVariable("employeeId") Long employeeId,
            @RequestParam(value = "month", required = false) Integer month,
            @RequestParam(value = "year", required = false) Integer year) {
        
        int currentMonth = month != null ? month : LocalDate.now().getMonthValue();
        int currentYear = year != null ? year : LocalDate.now().getYear();

        List<AttendanceRecord> records = attendanceService.getEmployeeAttendance(employeeId, currentMonth, currentYear);
        return ResponseEntity.ok(new ApiResponse<>("Employee attendance history fetched successfully", records));
    }

    @PostMapping("/clock-in")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<AttendanceRecord>> clockIn(@RequestBody AttendanceDtos.ClockInRequest request) {
        AttendanceRecord record = attendanceService.clockIn(request);
        return ResponseEntity.ok(new ApiResponse<>("Clock-in successful", record));
    }

    @PostMapping("/clock-out")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<AttendanceRecord>> clockOut(@RequestBody AttendanceDtos.ClockOutRequest request) {
        AttendanceRecord record = attendanceService.clockOut(request);
        return ResponseEntity.ok(new ApiResponse<>("Clock-out successful", record));
    }

    @PutMapping("/override/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<AttendanceRecord>> overrideAttendance(
            @PathVariable("id") Long id,
            @RequestBody AttendanceDtos.OverrideRequest request) {
        AttendanceRecord record = attendanceService.overrideAttendance(id, request);
        return ResponseEntity.ok(new ApiResponse<>("Attendance overridden and audit logged successfully", record));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceAuditLog>>> getAuditLogs(
            @RequestParam(value = "employeeId", required = false) Long employeeId) {
        List<AttendanceAuditLog> auditLogs = attendanceService.getAuditLogs(employeeId);
        return ResponseEntity.ok(new ApiResponse<>("Attendance audit logs fetched successfully", auditLogs));
    }
}
