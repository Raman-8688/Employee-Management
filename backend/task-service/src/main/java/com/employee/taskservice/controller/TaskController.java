package com.employee.taskservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.taskservice.entity.SubTask;
import com.employee.taskservice.entity.TaskComment;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.entity.TaskTimeLog;
import com.employee.taskservice.service.SprintMetricsService;
import com.employee.taskservice.service.TaskService;
import com.employee.taskservice.service.TimeTrackingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final TimeTrackingService timeTrackingService;
    private final SprintMetricsService sprintMetricsService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskItem>>> getTasks(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "taskType", required = false) String taskType,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "assigneeId", required = false) Long assigneeId,
            @RequestParam(value = "department", required = false) String department
    ) {
        List<TaskItem> tasks;
        if (status != null || taskType != null || priority != null || assigneeId != null || department != null) {
            tasks = taskService.filterTasks(status, taskType, priority, assigneeId, department);
        } else {
            tasks = taskService.getAllTasks();
        }
        return ResponseEntity.ok(new ApiResponse<>("Tasks fetched successfully", tasks));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<ApiResponse<List<TaskItem>>> getMyTasks(
            @RequestParam("assigneeId") Long assigneeId
    ) {
        List<TaskItem> myTasks = taskService.filterTasks(null, null, null, assigneeId, null);
        return ResponseEntity.ok(new ApiResponse<>("My tasks fetched successfully", myTasks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskItem>> getTaskById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(new ApiResponse<>("Task fetched successfully", taskService.getTaskById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskItem>> createTask(@RequestBody TaskItem task) {
        return ResponseEntity.ok(new ApiResponse<>("Task created successfully", taskService.createTask(task)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskItem>> updateTask(
            @PathVariable("id") Long id,
            @RequestBody TaskItem task,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "userRole", required = false) String userRole
    ) {
        if (userId != null && !taskService.canUserModifyTask(id, userId, userRole)) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access Denied: Standard employees can only edit tasks assigned to them.", null));
        }
        return ResponseEntity.ok(new ApiResponse<>("Task updated successfully", taskService.updateTask(id, task)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskItem>> updateTaskStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "userRole", required = false) String userRole
    ) {
        if (userId != null && !taskService.canUserModifyTask(id, userId, userRole)) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access Denied: Standard employees can only status update tasks assigned to them.", null));
        }
        return ResponseEntity.ok(new ApiResponse<>("Task status updated successfully", taskService.updateTaskStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable("id") Long id,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "userRole", required = false) String userRole
    ) {
        if (userId != null && !taskService.canUserModifyTask(id, userId, userRole)) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access Denied: Standard employees cannot delete tasks assigned to others.", null));
        }
        taskService.deleteTask(id);
        return ResponseEntity.ok(new ApiResponse<>("Task deleted successfully", null));
    }

    // SubTask Endpoints
    @Data
    public static class SubTaskRequest {
        private String title;
    }

    @PostMapping("/{taskId}/subtasks")
    public ResponseEntity<ApiResponse<SubTask>> addSubTask(
            @PathVariable("taskId") Long taskId,
            @RequestBody SubTaskRequest req
    ) {
        SubTask created = taskService.addSubTask(taskId, req.getTitle());
        return ResponseEntity.ok(new ApiResponse<>("SubTask added successfully", created));
    }

    @PatchMapping("/subtasks/{subId}/toggle")
    public ResponseEntity<ApiResponse<SubTask>> toggleSubTask(@PathVariable("subId") Long subId) {
        SubTask toggled = taskService.toggleSubTask(subId);
        return ResponseEntity.ok(new ApiResponse<>("SubTask toggled successfully", toggled));
    }

    @DeleteMapping("/subtasks/{subId}")
    public ResponseEntity<ApiResponse<Void>> deleteSubTask(@PathVariable("subId") Long subId) {
        taskService.deleteSubTask(subId);
        return ResponseEntity.ok(new ApiResponse<>("SubTask deleted successfully", null));
    }

    // Comment Endpoints
    @Data
    public static class CommentRequest {
        private String authorName;
        private String content;
    }

    @PostMapping("/{taskId}/comments")
    public ResponseEntity<ApiResponse<TaskComment>> addComment(
            @PathVariable("taskId") Long taskId,
            @RequestBody CommentRequest req
    ) {
        TaskComment created = taskService.addComment(taskId, req.getAuthorName(), req.getContent());
        return ResponseEntity.ok(new ApiResponse<>("Comment added successfully", created));
    }

    @GetMapping("/{taskId}/comments")
    public ResponseEntity<ApiResponse<List<TaskComment>>> getComments(@PathVariable("taskId") Long taskId) {
        return ResponseEntity.ok(new ApiResponse<>("Comments fetched successfully", taskService.getComments(taskId)));
    }

    // Time Log Endpoints
    @Data
    public static class TimeLogRequest {
        private Long employeeId;
        private Double hoursSpent;
        private String description;
    }

    @PostMapping("/{taskId}/time-logs")
    public ResponseEntity<ApiResponse<TaskTimeLog>> logTime(
            @PathVariable("taskId") Long taskId,
            @RequestBody TimeLogRequest req
    ) {
        TaskTimeLog log = timeTrackingService.logTime(taskId, req.getEmployeeId(), req.getHoursSpent(), req.getDescription());
        return ResponseEntity.ok(new ApiResponse<>("Time logged successfully", log));
    }

    @GetMapping("/{taskId}/time-logs")
    public ResponseEntity<ApiResponse<List<TaskTimeLog>>> getTimeLogs(@PathVariable("taskId") Long taskId) {
        return ResponseEntity.ok(new ApiResponse<>("Time logs fetched successfully", timeTrackingService.getTimeLogsForTask(taskId)));
    }

    // Sprint & Employee Productivity Analytics Endpoints
    @GetMapping("/analytics/sprint")
    public ResponseEntity<ApiResponse<SprintMetricsService.SprintMetrics>> getSprintAnalytics() {
        return ResponseEntity.ok(new ApiResponse<>("Sprint metrics fetched", sprintMetricsService.getWeeklySprintMetrics()));
    }

    @GetMapping("/analytics/employee/{employeeId}")
    public ResponseEntity<ApiResponse<SprintMetricsService.EmployeeTaskAnalytics>> getEmployeeAnalytics(
            @PathVariable("employeeId") Long employeeId
    ) {
        return ResponseEntity.ok(new ApiResponse<>("Employee analytics fetched", sprintMetricsService.getEmployeeAnalytics(employeeId)));
    }
}
