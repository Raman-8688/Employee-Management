package com.employee.taskservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.taskservice.entity.TaskLearning;
import com.employee.taskservice.service.TaskLearningService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/learnings")
@RequiredArgsConstructor
public class TaskLearningController {

    private final TaskLearningService learningService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskLearning>>> getLearnings(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "query", required = false) String query
    ) {
        List<TaskLearning> learnings = learningService.searchLearnings(category, query);
        return ResponseEntity.ok(new ApiResponse<>("Task learnings fetched successfully", learnings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskLearning>> getLearningById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(new ApiResponse<>("Task learning fetched successfully", learningService.getLearningById(id)));
    }

    @Data
    public static class CreateLearningRequest {
        private Long taskId;
        private Long employeeId;
        private String employeeName;
        private String title;
        private String category;
        private String content;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskLearning>> createLearning(@RequestBody CreateLearningRequest req) {
        TaskLearning created = learningService.createLearning(
                req.getTaskId(),
                req.getEmployeeId(),
                req.getEmployeeName(),
                req.getTitle(),
                req.getCategory(),
                req.getContent()
        );
        return ResponseEntity.ok(new ApiResponse<>("Task learning created successfully", created));
    }
}
