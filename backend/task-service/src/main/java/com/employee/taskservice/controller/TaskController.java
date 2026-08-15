package com.employee.taskservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskItem>>> getAllTasks() {
        return ResponseEntity.ok(new ApiResponse<>("Tasks fetched successfully", taskService.getAllTasks()));
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
    public ResponseEntity<ApiResponse<TaskItem>> updateTask(@PathVariable("id") Long id, @RequestBody TaskItem task) {
        return ResponseEntity.ok(new ApiResponse<>("Task updated successfully", taskService.updateTask(id, task)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskItem>> updateTaskStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return ResponseEntity.ok(new ApiResponse<>("Task status updated successfully", taskService.updateTaskStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable("id") Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(new ApiResponse<>("Task deleted successfully", null));
    }
}
