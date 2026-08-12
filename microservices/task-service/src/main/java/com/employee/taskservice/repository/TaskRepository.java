package com.employee.taskservice.repository;

import com.employee.taskservice.entity.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findByAssigneeId(Long assigneeId);
    List<TaskItem> findByStatus(String status);
    List<TaskItem> findByDepartment(String department);
}
