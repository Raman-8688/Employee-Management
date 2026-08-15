package com.employee.employeeservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.employeeservice.service.NvidiaAiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AiCopilotController {

    private final NvidiaAiService nvidiaAiService;

    @GetMapping("/models")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableModels() {
        List<String> models = Arrays.asList(
                "meta/llama-3.1-8b-instruct",
                "meta/llama-3.1-70b-instruct",
                "meta/llama3-8b-instruct",
                "mistralai/mistral-7b-instruct-v0.2",
                "google/gemma-2-27b-it"
        );
        return ResponseEntity.ok(new ApiResponse<>("Available Nvidia AI models fetched", models));
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(@RequestBody ChatRequest request) {
        String messageText = request.getMessage() != null && !request.getMessage().trim().isEmpty() 
                ? request.getMessage() 
                : request.getPrompt();

        if (messageText == null || messageText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("Message prompt cannot be empty", null));
        }

        Map<String, Object> result = nvidiaAiService.generateChatResponse(
                messageText, 
                request.getModel(), 
                request.getContext(), 
                request.getSystemPrompt()
        );

        return ResponseEntity.ok(new ApiResponse<>("AI response generated successfully", result));
    }

    @PostMapping("/performance-review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generatePerformanceReview(
            @RequestBody PerformanceReviewRequest request) {
        Map<String, Object> result = nvidiaAiService.generatePerformanceReview(request.getId());
        return ResponseEntity.ok(new ApiResponse<>("Performance review generated successfully", result));
    }

    @PostMapping(value = "/analyze-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "question", required = false) String question) {
        Map<String, Object> result = nvidiaAiService.analyzeDocument(file, question);
        return ResponseEntity.ok(new ApiResponse<>("Document analyzed successfully", result));
    }

    @Data
    public static class ChatRequest {
        private String message;
        private String prompt;
        private String model;
        private String context;
        private String systemPrompt;
    }

    @Data
    public static class PerformanceReviewRequest {
        private Long id;
    }
}
