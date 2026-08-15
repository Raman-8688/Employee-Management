package com.employee.taskservice.repository;

import com.employee.taskservice.entity.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findByAssigneeId(Long assigneeId);
    List<TaskItem> findByStatus(String status);
    List<TaskItem> findByDepartment(String department);
    List<TaskItem> findByTaskType(String taskType);

    @Query("SELECT t FROM TaskItem t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:taskType IS NULL OR t.taskType = :taskType) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assigneeId IS NULL OR t.assigneeId = :assigneeId) AND " +
           "(:department IS NULL OR LOWER(t.department) LIKE LOWER(CONCAT('%', :department, '%')))")
    List<TaskItem> filterTasks(
            @Param("status") String status,
            @Param("taskType") String taskType,
            @Param("priority") String priority,
            @Param("assigneeId") Long assigneeId,
            @Param("department") String department
    );

    List<TaskItem> findByAssigneeIdAndStatus(Long assigneeId, String status);

    @Query("SELECT COUNT(t) FROM TaskItem t WHERE t.assigneeId = :assigneeId AND t.status = 'DONE' AND t.taskType = 'BUG'")
    long countCompletedBugsByAssignee(@Param("assigneeId") Long assigneeId);

    @Query("SELECT COUNT(t) FROM TaskItem t WHERE t.assigneeId = :assigneeId AND t.status = 'DONE'")
    long countCompletedTasksByAssignee(@Param("assigneeId") Long assigneeId);

    List<TaskItem> findByCreatedAtAfter(LocalDateTime startDate);
}
