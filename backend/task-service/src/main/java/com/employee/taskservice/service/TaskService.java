package com.employee.taskservice.service;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import com.employee.taskservice.client.EmployeeClient;
import com.employee.taskservice.client.NotificationEventDispatcher;

import com.employee.taskservice.entity.SubTask;
import com.employee.taskservice.entity.TaskComment;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.entity.TaskTimeLog;
import com.employee.taskservice.repository.SubTaskRepository;
import com.employee.taskservice.repository.TaskCommentRepository;
import com.employee.taskservice.repository.TaskRepository;
import com.employee.taskservice.repository.TaskTimeLogRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;
    private final TaskCommentRepository commentRepository;
    private final TaskTimeLogRepository timeLogRepository;
    private final EmployeeClient employeeClient;
    private final NotificationEventDispatcher notificationEventDispatcher;


    @PostConstruct
    public void initSeedData() {
        if (taskRepository.count() == 0) {
            log.info("Seeding initial Jira-level tasks into task_db...");

            TaskItem task1 = taskRepository.save(TaskItem.builder()
                    .title("Configure Spring Cloud Gateway Dynamic Ingress")
                    .description("Set up microservices routing, dynamic Eureka discovery, rate limiting, and global CORS headers.")
                    .taskType("STORY")
                    .priority("HIGH")
                    .status("DONE")
                    .assigneeId(1L)
                    .assigneeName("Raman")
                    .department("IT")
                    .reporterName("System Admin")
                    .estimatedHours(12.0)
                    .loggedHours(10.5)
                    .tags("Gateway,Security,SpringCloud")
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build());

            subTaskRepository.save(SubTask.builder().title("Configure route predicates").completed(true).task(task1).build());
            subTaskRepository.save(SubTask.builder().title("Verify header deduplication").completed(true).task(task1).build());

            commentRepository.save(TaskComment.builder().authorName("Raman").content("Ingress routing verified across all endpoints.").task(task1).build());

            TaskItem task2 = taskRepository.save(TaskItem.builder()
                    .title("Refactor Angular Microservices Core Architecture")
                    .description("Migrate components into core, shared, and feature modular enterprise folder structures.")
                    .taskType("TASK")
                    .priority("HIGH")
                    .status("IN_PROGRESS")
                    .assigneeId(2L)
                    .assigneeName("Ramesh")
                    .department("IT")
                    .reporterName("System Admin")
                    .estimatedHours(16.0)
                    .loggedHours(6.0)
                    .tags("Angular,Frontend,Architecture")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build());

            subTaskRepository.save(SubTask.builder().title("Create standalone feature modules").completed(true).task(task2).build());
            subTaskRepository.save(SubTask.builder().title("Implement Amazon sliding sidebar").completed(false).task(task2).build());

            TaskItem task3 = taskRepository.save(TaskItem.builder()
                    .title("Integrate Nvidia Llama 3.1 8B AI Engine")
                    .description("Implement REST proxy controller to stream Nvidia AI prompts for performance evaluation.")
                    .taskType("STORY")
                    .priority("CRITICAL")
                    .status("IN_REVIEW")
                    .assigneeId(3L)
                    .assigneeName("Shyam Sundar")
                    .department("IT")
                    .reporterName("Tech Lead")
                    .estimatedHours(20.0)
                    .loggedHours(18.0)
                    .tags("AI,Nvidia,LLM")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            TaskItem task4 = taskRepository.save(TaskItem.builder()
                    .title("Fix CORS Preflight Headers on Auth Controller")
                    .description("Remove duplicate Access-Control-Allow-Origin annotations and centralize header deduplication.")
                    .taskType("BUG")
                    .priority("CRITICAL")
                    .status("DONE")
                    .assigneeId(1L)
                    .assigneeName("Raman")
                    .department("IT")
                    .reporterName("QA Engineer")
                    .estimatedHours(4.0)
                    .loggedHours(3.5)
                    .tags("BugFix,CORS,Auth")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            TaskItem task5 = taskRepository.save(TaskItem.builder()
                    .title("Audit Payroll Tax Deduction Calculations")
                    .description("Verify itemized tax deduction formulas and automated text payslip generator.")
                    .taskType("TASK")
                    .priority("LOW")
                    .status("TODO")
                    .assigneeId(4L)
                    .assigneeName("Vikash")
                    .department("Operations")
                    .reporterName("HR Manager")
                    .estimatedHours(8.0)
                    .loggedHours(0.0)
                    .tags("Payroll,Audit")
                    .createdAt(LocalDateTime.now())
                    .build());
        }
    }

    public List<TaskItem> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<TaskItem> filterTasks(String status, String taskType, String priority, Long assigneeId, String department) {
        return taskRepository.filterTasks(
                (status != null && !status.isEmpty()) ? status : null,
                (taskType != null && !taskType.isEmpty()) ? taskType : null,
                (priority != null && !priority.isEmpty()) ? priority : null,
                assigneeId,
                (department != null && !department.isEmpty()) ? department : null
        );
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
        TaskItem saved = taskRepository.save(task);
        notificationEventDispatcher.dispatchTaskCreatedNotification(saved);
        return saved;
    }

    @Transactional
    public TaskItem updateTask(Long id, TaskItem updatedTask) {
        TaskItem existing = getTaskById(id);
        String oldStatus = existing.getStatus();
        String newStatus = updatedTask.getStatus();

        existing.setTitle(updatedTask.getTitle());
        existing.setDescription(updatedTask.getDescription());
        existing.setPriority(updatedTask.getPriority());
        existing.setTaskType(updatedTask.getTaskType());
        existing.setStatus(newStatus);
        existing.setAssigneeId(updatedTask.getAssigneeId());
        existing.setAssigneeName(updatedTask.getAssigneeName());
        existing.setDepartment(updatedTask.getDepartment());
        if (updatedTask.getEstimatedHours() != null) {
            existing.setEstimatedHours(updatedTask.getEstimatedHours());
        }
        if (updatedTask.getTags() != null) {
            existing.setTags(updatedTask.getTags());
        }

        // Automated Task Duration Calculation when moved to DONE
        checkAndApplyAutoTimeLog(existing, oldStatus, newStatus);

        TaskItem saved = taskRepository.save(existing);
        if (oldStatus == null || !oldStatus.equalsIgnoreCase(newStatus)) {
            notificationEventDispatcher.dispatchTaskStatusUpdatedNotification(saved, oldStatus, newStatus);
        }
        return saved;
    }

    @Transactional
    public TaskItem updateTaskStatus(Long id, String status) {
        TaskItem task = getTaskById(id);
        String oldStatus = task.getStatus();
        task.setStatus(status);

        // Automated Task Duration Calculation when moved to DONE
        checkAndApplyAutoTimeLog(task, oldStatus, status);

        TaskItem saved = taskRepository.save(task);
        if (oldStatus == null || !oldStatus.equalsIgnoreCase(status)) {
            notificationEventDispatcher.dispatchTaskStatusUpdatedNotification(saved, oldStatus, status);
        }
        return saved;
    }

    private void checkAndApplyAutoTimeLog(TaskItem task, String oldStatus, String newStatus) {
        if ("DONE".equalsIgnoreCase(newStatus) && !"DONE".equalsIgnoreCase(oldStatus)) {
            Double currentLogged = task.getLoggedHours();
            if (currentLogged == null || currentLogged == 0.0) {
                LocalDateTime start = task.getCreatedAt() != null ? task.getCreatedAt() : LocalDateTime.now().minusHours(2);
                long minutes = Math.max(30, Duration.between(start, LocalDateTime.now()).toMinutes());
                double autoHours = Math.round((minutes / 60.0) * 10.0) / 10.0;

                TaskTimeLog autoLog = TaskTimeLog.builder()
                        .task(task)
                        .employeeId(task.getAssigneeId() != null ? task.getAssigneeId() : 1L)
                        .employeeName(task.getAssigneeName() != null ? task.getAssigneeName() : "Assigned Engineer")
                        .hoursSpent(autoHours)
                        .logDate(LocalDateTime.now())
                        .description("Automated Task Duration Calculation on Completion (" + autoHours + " hrs elapsed)")
                        .build();

                timeLogRepository.save(autoLog);
                task.setLoggedHours(autoHours);
                log.info("Automated time tracking calculated {} hrs for completed task #{}", autoHours, task.getId());
            }
        }
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // SubTask Operations
    @Transactional
    public SubTask addSubTask(Long taskId, String title) {
        TaskItem task = getTaskById(taskId);
        SubTask subTask = SubTask.builder()
                .title(title)
                .completed(false)
                .task(task)
                .build();
        return subTaskRepository.save(subTask);
    }

    @Transactional
    public SubTask toggleSubTask(Long subTaskId) {
        SubTask subTask = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new IllegalArgumentException("SubTask not found with id: " + subTaskId));
        subTask.setCompleted(!subTask.isCompleted());
        return subTaskRepository.save(subTask);
    }

    @Transactional
    public void deleteSubTask(Long subTaskId) {
        subTaskRepository.deleteById(subTaskId);
    }

    // Comment Operations
    @Transactional
    public TaskComment addComment(Long taskId, String authorName, String content) {
        TaskItem task = getTaskById(taskId);
        TaskComment comment = TaskComment.builder()
                .authorName(authorName != null && !authorName.isEmpty() ? authorName : "System User")
                .content(content)
                .createdAt(LocalDateTime.now())
                .task(task)
                .build();
        return commentRepository.save(comment);
    }

    public List<TaskComment> getComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }

    public boolean canUserModifyTask(Long taskId, Long userId, String userRole) {
        if (userRole != null && (userRole.equals("ROLE_ADMIN") || userRole.equals("ROLE_MANAGER") || userRole.equals("ROLE_HR"))) {
            return true;
        }
        TaskItem task = getTaskById(taskId);
        return task.getAssigneeId() != null && task.getAssigneeId().equals(userId);
    }
}
