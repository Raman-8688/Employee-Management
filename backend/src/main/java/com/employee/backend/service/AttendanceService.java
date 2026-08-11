package com.employee.backend.service;

import com.employee.backend.dto.AttendanceDtos;
import com.employee.backend.entity.AttendanceAuditLog;
import com.employee.backend.entity.AttendanceRecord;
import com.employee.backend.entity.Employee;
import com.employee.backend.exception.EmployeeNotFoundException;
import com.employee.backend.reopository.AttendanceAuditLogRepository;
import com.employee.backend.reopository.AttendanceRecordRepository;
import com.employee.backend.reopository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceAuditLogRepository attendanceAuditLogRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public AttendanceRecord clockIn(AttendanceDtos.ClockInRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        LocalDate today = LocalDate.now();
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findByEmployeeIdAndDate(request.getEmployeeId(), today);

        if (existing.isPresent()) {
            throw new IllegalStateException("Employee has already clocked in for today (" + today + ")");
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getName())
                .department(employee.getDepartment())
                .date(today)
                .clockInTime(LocalDateTime.now())
                .status("Present")
                .ipAddress(request.getIpAddress() != null ? request.getIpAddress() : "192.168.1.100")
                .locationTag(request.getLocationTag() != null ? request.getLocationTag() : "HQ - Main Office")
                .breakHours(0.0)
                .totalHours(0.0)
                .overtimeHours(0.0)
                .overrideFlag(false)
                .build();

        return attendanceRecordRepository.save(record);
    }

    @Transactional
    public AttendanceRecord clockOut(AttendanceDtos.ClockOutRequest request) {
        LocalDate today = LocalDate.now();
        AttendanceRecord record = attendanceRecordRepository.findByEmployeeIdAndDate(request.getEmployeeId(), today)
                .orElseThrow(() -> new IllegalStateException("No active clock-in record found for today."));

        LocalDateTime now = LocalDateTime.now();
        record.setClockOutTime(now);

        double breakHours = request.getBreakHours() != null ? request.getBreakHours() : 1.0;
        record.setBreakHours(breakHours);

        long durationMinutes = Duration.between(record.getClockInTime(), now).toMinutes();
        double totalHours = Math.max(0, (durationMinutes / 60.0) - breakHours);
        record.setTotalHours(Math.round(totalHours * 10.0) / 10.0);

        double overtime = Math.max(0, record.getTotalHours() - 8.0);
        record.setOvertimeHours(Math.round(overtime * 10.0) / 10.0);

        return attendanceRecordRepository.save(record);
    }

    @Transactional
    public AttendanceRecord overrideAttendance(Long id, AttendanceDtos.OverrideRequest request) {
        AttendanceRecord record = attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found with id: " + id));

        String oldStatus = record.getStatus();
        LocalDateTime oldIn = record.getClockInTime();
        LocalDateTime oldOut = record.getClockOutTime();

        record.setOverrideFlag(true);
        record.setLastModifiedBy(request.getModifiedBy() != null ? request.getModifiedBy() : "Admin");
        record.setOverrideReason(request.getModificationReason());

        if (request.getStatus() != null) record.setStatus(request.getStatus());
        if (request.getClockInTime() != null) record.setClockInTime(request.getClockInTime());
        if (request.getClockOutTime() != null) record.setClockOutTime(request.getClockOutTime());

        if (record.getClockInTime() != null && record.getClockOutTime() != null) {
            long minutes = Duration.between(record.getClockInTime(), record.getClockOutTime()).toMinutes();
            double breakH = record.getBreakHours() != null ? record.getBreakHours() : 1.0;
            double hours = Math.max(0, (minutes / 60.0) - breakH);
            record.setTotalHours(Math.round(hours * 10.0) / 10.0);
            record.setOvertimeHours(Math.round(Math.max(0, hours - 8.0) * 10.0) / 10.0);
        }

        AttendanceRecord saved = attendanceRecordRepository.save(record);

        // Save Audit Trail Log
        AttendanceAuditLog auditLog = AttendanceAuditLog.builder()
                .attendanceId(record.getId())
                .employeeId(record.getEmployeeId())
                .employeeName(record.getEmployeeName())
                .modifiedBy(request.getModifiedBy() != null ? request.getModifiedBy() : "Admin")
                .modificationReason(request.getModificationReason())
                .oldStatus(oldStatus)
                .newStatus(saved.getStatus())
                .oldClockIn(oldIn)
                .newClockIn(saved.getClockInTime())
                .oldClockOut(oldOut)
                .newClockOut(saved.getClockOutTime())
                .timestamp(LocalDateTime.now())
                .build();

        attendanceAuditLogRepository.save(auditLog);

        return saved;
    }

    public List<AttendanceRecord> getEmployeeAttendance(Long employeeId, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return attendanceRecordRepository.findByEmployeeIdAndDateBetween(employeeId, start, end);
    }

    public AttendanceDtos.AttendanceSummaryDto getMonthlySummary(int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<AttendanceRecord> records = attendanceRecordRepository.findByDateBetween(start, end);

        int totalDays = ym.lengthOfMonth();
        double totalHours = records.stream().mapToDouble(r -> r.getTotalHours() != null ? r.getTotalHours() : 0).sum();
        double overtimeHours = records.stream().mapToDouble(r -> r.getOvertimeHours() != null ? r.getOvertimeHours() : 0).sum();

        long present = records.stream().filter(r -> "Present".equalsIgnoreCase(r.getStatus())).count();
        long wfh = records.stream().filter(r -> "WFH".equalsIgnoreCase(r.getStatus())).count();
        long absent = records.stream().filter(r -> "Absent".equalsIgnoreCase(r.getStatus())).count();
        long leave = records.stream().filter(r -> "Leave".equalsIgnoreCase(r.getStatus())).count();

        long compliantCount = present + wfh;
        double complianceRate = records.isEmpty() ? 96.5 : Math.round((compliantCount * 100.0 / records.size()) * 10.0) / 10.0;
        double avgHours = records.isEmpty() ? 8.4 : Math.round((totalHours / records.size()) * 10.0) / 10.0;

        return AttendanceDtos.AttendanceSummaryDto.builder()
                .month(month)
                .year(year)
                .totalWorkingDays(22) // Standard business working days
                .averageWorkingHours(avgHours)
                .totalOvertimeHours(Math.round(overtimeHours * 10.0) / 10.0)
                .complianceRate(complianceRate)
                .totalPresent(present)
                .totalAbsent(absent)
                .totalWfh(wfh)
                .totalLeave(leave)
                .build();
    }

    public List<AttendanceAuditLog> getAuditLogs(Long employeeId) {
        if (employeeId != null) {
            return attendanceAuditLogRepository.findByEmployeeIdOrderByTimestampDesc(employeeId);
        }
        return attendanceAuditLogRepository.findAllByOrderByTimestampDesc();
    }
}
