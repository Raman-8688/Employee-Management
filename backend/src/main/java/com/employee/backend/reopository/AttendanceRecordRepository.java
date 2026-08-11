package com.employee.backend.reopository;

import com.employee.backend.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByEmployeeId(Long employeeId);

    List<AttendanceRecord> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate);

    Optional<AttendanceRecord> findByEmployeeIdAndDate(Long employeeId, LocalDate date);
}
