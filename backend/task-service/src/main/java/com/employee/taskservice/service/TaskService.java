package com.employee.taskservice.service;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import com.employee.taskservice.client.EmployeeClient;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeClient employeeClient;

    public List<TaskItem> getAllTasks() {
        return taskRepository.findAll();
    }

    public TaskItem getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    public TaskItem createTask(TaskItem task) {
        if (task.getAssigneeId() != null) {
            try {
                ApiResponse<EmployeeDto> response = employeeClient.getEmployeeById(task.getAssigneeId());
                if (response != null && response.getData() != null) {
                    EmployeeDto emp = response.getData();
                    task.setAssigneeName(emp.getName());
                    task.setAssigneeAvatar(emp.getProfileImageUrl());
                    task.setDepartment(emp.getDepartment());
                }
            } catch (Exception ex) {
                log.warn("Could not fetch employee details from employee-service: {}", ex.getMessage());
            }
        }
        return taskRepository.save(task);
    }

    public TaskItem updateTaskStatus(Long id, String status) {
        TaskItem task = getTaskById(id);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
