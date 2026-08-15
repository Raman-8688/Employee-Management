package com.employee.taskservice.repository;

import com.employee.taskservice.entity.TaskTimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskTimeLogRepository extends JpaRepository<TaskTimeLog, Long> {
    List<TaskTimeLog> findByTaskIdOrderByLogDateDesc(Long taskId);
    List<TaskTimeLog> findByEmployeeId(Long employeeId);

    @Query("SELECT SUM(tl.hoursSpent) FROM TaskTimeLog tl WHERE tl.task.id = :taskId")
    Double sumHoursByTaskId(@Param("taskId") Long taskId);

    @Query("SELECT SUM(tl.hoursSpent) FROM TaskTimeLog tl WHERE tl.employeeId = :employeeId")
    Double sumHoursByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT SUM(tl.hoursSpent) FROM TaskTimeLog tl WHERE tl.logDate >= :startDate")
    Double sumHoursSinceDate(@Param("startDate") LocalDateTime startDate);
}
