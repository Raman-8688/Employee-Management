package com.employee.backend.controller;

import com.employee.backend.dto.ApiResponse;
import com.employee.backend.dto.AiDtos;
import com.employee.backend.service.NvidiaAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AiCopilotController {

    private final NvidiaAiService nvidiaAiService;

    @PostMapping("/chat")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<AiDtos.AiChatResponse>> chat(@RequestBody AiDtos.AiChatRequest request) {
        AiDtos.AiChatResponse response = nvidiaAiService.generateChatResponse(request);
        return ResponseEntity.ok(new ApiResponse<>("AI response generated successfully", response));
    }

    @PostMapping("/performance-review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<AiDtos.AiChatResponse>> generatePerformanceReview(
            @RequestBody AiDtos.EmployeeDetailRequest request) {
        AiDtos.AiChatResponse response = nvidiaAiService.generatePerformanceReview(request.getId());
        return ResponseEntity.ok(new ApiResponse<>("Performance review generated successfully", response));
    }

    @PostMapping(value = "/analyze-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<AiDtos.AiChatResponse>> analyzeDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "question", required = false) String question) {
        AiDtos.AiChatResponse response = nvidiaAiService.analyzeDocument(file, question);
        return ResponseEntity.ok(new ApiResponse<>("Document analyzed successfully", response));
    }

    @GetMapping("/models")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
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
}
