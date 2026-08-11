package com.employee.backend.reopository;

import com.employee.backend.entity.AttendanceAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceAuditLogRepository extends JpaRepository<AttendanceAuditLog, Long> {

    List<AttendanceAuditLog> findByEmployeeIdOrderByTimestampDesc(Long employeeId);

    List<AttendanceAuditLog> findAllByOrderByTimestampDesc();
}
