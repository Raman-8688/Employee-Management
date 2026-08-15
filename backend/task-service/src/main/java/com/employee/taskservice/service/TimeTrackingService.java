package com.employee.taskservice.service;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import com.employee.taskservice.client.EmployeeClient;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.entity.TaskTimeLog;
import com.employee.taskservice.repository.TaskRepository;
import com.employee.taskservice.repository.TaskTimeLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeTrackingService {

    private final TaskTimeLogRepository taskTimeLogRepository;
    private final TaskRepository taskRepository;
    private final EmployeeClient employeeClient;

    @Transactional
    public TaskTimeLog logTime(Long taskId, Long employeeId, Double hoursSpent, String description) {
        TaskItem task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with id: " + taskId));

        String employeeName = "Employee #" + employeeId;
        if (employeeId != null) {
            try {
                ApiResponse<EmployeeDto> response = employeeClient.getEmployeeById(employeeId);
                if (response != null && response.getData() != null) {
                    EmployeeDto dto = response.getData();
                    employeeName = dto.getName();
                }
            } catch (Exception e) {
                log.warn("Could not fetch employee details from employee-service for id {}: {}", employeeId, e.getMessage());
            }
        }

        TaskTimeLog timeLog = TaskTimeLog.builder()
                .task(task)
                .employeeId(employeeId)
                .employeeName(employeeName)
                .hoursSpent(hoursSpent)
                .description(description)
                .logDate(LocalDateTime.now())
                .build();

        TaskTimeLog savedLog = taskTimeLogRepository.save(timeLog);

        // Recalculate and update total logged hours on task
        Double totalHours = taskTimeLogRepository.sumHoursByTaskId(taskId);
        task.setLoggedHours(totalHours != null ? totalHours : 0.0);
        taskRepository.save(task);

        return savedLog;
    }

    public List<TaskTimeLog> getTimeLogsForTask(Long taskId) {
        return taskTimeLogRepository.findByTaskIdOrderByLogDateDesc(taskId);
    }

    public List<TaskTimeLog> getTimeLogsForEmployee(Long employeeId) {
        return taskTimeLogRepository.findByEmployeeId(employeeId);
    }
}
