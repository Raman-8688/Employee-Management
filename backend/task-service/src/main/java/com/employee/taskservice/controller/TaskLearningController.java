package com.employee.taskservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.taskservice.entity.TaskLearning;
import com.employee.taskservice.service.TaskLearningService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/learnings")
@RequiredArgsConstructor
@Slf4j
public class TaskLearningController {

    private final TaskLearningService learningService;
    private static final String UPLOAD_DIR = "uploads/learnings/";

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
        private String attachmentUrl;
        private String fileType;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskLearning>> createLearning(@RequestBody CreateLearningRequest req) {
        TaskLearning created = learningService.createLearning(
                req.getTaskId(),
                req.getEmployeeId(),
                req.getEmployeeName(),
                req.getTitle(),
                req.getCategory(),
                req.getContent(),
                req.getAttachmentUrl(),
                req.getFileType()
        );
        return ResponseEntity.ok(new ApiResponse<>("Task learning created successfully", created));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAttachment(@RequestParam("file") MultipartFile file) {
        try {
            File folder = new File(UPLOAD_DIR);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR + newFilename);
            Files.write(filePath, file.getBytes());

            String fileUrl = "http://localhost:8080/uploads/learnings/" + newFilename;
            String fileType = extension.replace(".", "").toUpperCase();
            if (fileType.isEmpty()) fileType = "DOC";

            Map<String, String> res = new HashMap<>();
            res.put("url", fileUrl);
            res.put("fileUrl", fileUrl);
            res.put("fileType", fileType);
            res.put("originalName", originalName);

            return ResponseEntity.ok(new ApiResponse<>("File uploaded successfully", res));
        } catch (Exception ex) {
            log.error("Failed to upload learning attachment file: {}", ex.getMessage(), ex);
            return ResponseEntity.status(500).body(new ApiResponse<>("Failed to upload file: " + ex.getMessage(), null));
        }
    }
}
