package com.employee.taskservice.service;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import com.employee.taskservice.client.EmployeeClient;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.repository.TaskRepository;
import jakarta.annotation.PostConstruct;
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

    @PostConstruct
    public void initSeedData() {
        if (taskRepository.count() == 0) {
            log.info("Seeding initial Jira-level tasks into task_db...");

            taskRepository.save(TaskItem.builder()
                    .title("Configure Spring Cloud Gateway Dynamic Ingress")
                    .description("Set up microservices routing, dynamic Eureka discovery, rate limiting, and global CORS headers.")
                    .taskType("STORY")
                    .priority("HIGH")
                    .status("DONE")
                    .assigneeId(1L)
                    .assigneeName("Raman")
                    .department("IT")
                    .reporterName("System Admin")
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build());

            taskRepository.save(TaskItem.builder()
                    .title("Refactor Angular Microservices Core Architecture")
                    .description("Migrate components into core, shared, and feature modular enterprise folder structures.")
                    .taskType("TASK")
                    .priority("HIGH")
                    .status("IN_PROGRESS")
                    .assigneeId(2L)
                    .assigneeName("Ramesh")
                    .department("IT")
                    .reporterName("System Admin")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build());

            taskRepository.save(TaskItem.builder()
                    .title("Integrate Nvidia Llama 3.1 8B AI Engine")
                    .description("Implement REST proxy controller to stream Nvidia AI prompts for performance evaluation.")
                    .taskType("STORY")
                    .priority("CRITICAL")
                    .status("IN_REVIEW")
                    .assigneeId(3L)
                    .assigneeName("Shyam Sundar")
                    .department("IT")
                    .reporterName("Tech Lead")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            taskRepository.save(TaskItem.builder()
                    .title("Fix CORS Preflight Headers on Auth Controller")
                    .description("Remove duplicate Access-Control-Allow-Origin annotations and centralize header deduplication.")
                    .taskType("BUG")
                    .priority("CRITICAL")
                    .status("DONE")
                    .assigneeId(1L)
                    .assigneeName("Raman")
                    .department("IT")
                    .reporterName("QA Engineer")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            taskRepository.save(TaskItem.builder()
                    .title("Audit Payroll Tax Deduction Calculations")
                    .description("Verify itemized tax deduction formulas and automated text payslip generator.")
                    .taskType("TASK")
                    .priority("LOW")
                    .status("TODO")
                    .assigneeId(4L)
                    .assigneeName("Vikash")
                    .department("Operations")
                    .reporterName("HR Manager")
                    .createdAt(LocalDateTime.now())
                    .build());
        }
    }

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

    public TaskItem updateTask(Long id, TaskItem updatedTask) {
        TaskItem existing = getTaskById(id);
        existing.setTitle(updatedTask.getTitle());
        existing.setDescription(updatedTask.getDescription());
        existing.setPriority(updatedTask.getPriority());
        existing.setTaskType(updatedTask.getTaskType());
        existing.setStatus(updatedTask.getStatus());
        existing.setAssigneeId(updatedTask.getAssigneeId());
        existing.setAssigneeName(updatedTask.getAssigneeName());
        existing.setDepartment(updatedTask.getDepartment());
        return taskRepository.save(existing);
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
