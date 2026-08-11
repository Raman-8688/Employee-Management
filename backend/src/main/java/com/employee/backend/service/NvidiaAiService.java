package com.employee.backend.service;

import com.employee.backend.dto.AiDtos;
import com.employee.backend.entity.Employee;
import com.employee.backend.exception.EmployeeNotFoundException;
import com.employee.backend.reopository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NvidiaAiService {

    private final EmployeeRepository employeeRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${nvidia.ai.api-key}")
    private String apiKey;

    @Value("${nvidia.ai.url}")
    private String apiUrl;

    @Value("${nvidia.ai.default-model:meta/llama-3.1-70b-instruct}")
    private String defaultModel;

    /**
     * Executes AI completion with automatic multi-model fallback.
     */
    public AiDtos.AiChatResponse generateChatResponse(AiDtos.AiChatRequest request) {
        String primaryModel = (request.getModel() != null && !request.getModel().trim().isEmpty())
                ? request.getModel()
                : defaultModel;

        // Fallback models if primary model fails or is rate-limited
        List<String> candidateModels = new ArrayList<>();
        candidateModels.add(primaryModel);
        if (!primaryModel.equals("meta/llama-3.1-8b-instruct")) {
            candidateModels.add("meta/llama-3.1-8b-instruct");
        }
        if (!primaryModel.equals("meta/llama-3.1-70b-instruct")) {
            candidateModels.add("meta/llama-3.1-70b-instruct");
        }
        if (!primaryModel.equals("meta/llama3-8b-instruct")) {
            candidateModels.add("meta/llama3-8b-instruct");
        }

        String systemInstruction = request.getSystemPrompt() != null 
                ? request.getSystemPrompt()
                : "You are an expert HR Assistant & Performance Copilot for an enterprise Employee Management System. Provide clear, professional, and actionable advice.";

        for (String modelName : candidateModels) {
            try {
                log.info("Attempting Nvidia AI completion with model: {}", modelName);
                String responseText = callNvidiaApi(modelName, systemInstruction, request.getMessage(), request.getContext());
                
                return AiDtos.AiChatResponse.builder()
                        .reply(responseText)
                        .modelUsed(modelName)
                        .timestamp(LocalDateTime.now())
                        .build();

            } catch (Exception ex) {
                log.warn("Nvidia AI Model [{}] failed with error: {}. Trying fallback model...", modelName, ex.getMessage());
            }
        }

        throw new RuntimeException("All Nvidia AI models failed to respond. Please verify your internet connection or try again later.");
    }

    /**
     * Generates an automated AI Performance Appraisal Review for an employee.
     */
    public AiDtos.AiChatResponse generatePerformanceReview(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + employeeId));

        String systemPrompt = "You are a Senior HR Executive in an MNC. Generate a professional, encouraging performance review evaluation for an employee based on their profile data.";

        String userPrompt = String.format(
                "Generate a detailed Performance Review and Career Appraisal for:\n" +
                "- Name: %s\n" +
                "- Email: %s\n" +
                "- Department: %s\n" +
                "- Salary: $%s\n\n" +
                "Include:\n" +
                "1. Summary of Accomplishments & Strengths\n" +
                "2. Key Competencies Evaluation\n" +
                "3. Recommended Growth Goals & Training Focus\n" +
                "4. Final Managerial Rating & Comments",
                employee.getName(), employee.getEmail(), employee.getDepartment(), employee.getSal()
        );

        AiDtos.AiChatRequest request = AiDtos.AiChatRequest.builder()
                .message(userPrompt)
                .model(defaultModel)
                .systemPrompt(systemPrompt)
                .build();

        return generateChatResponse(request);
    }

    /**
     * Analyzes uploaded HR documents (TXT/CSV/PDF text) using Nvidia AI.
     */
    public AiDtos.AiChatResponse analyzeDocument(MultipartFile file, String question) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot analyze empty file.");
        }

        try {
            String documentText = new String(file.getBytes(), StandardCharsets.UTF_8);
            if (documentText.length() > 8000) {
                documentText = documentText.substring(0, 8000) + "\n...[truncated for length]";
            }

            String prompt = (question != null && !question.trim().isEmpty())
                    ? question
                    : "Summarize this HR document and highlight key points, policies, or requirements.";

            AiDtos.AiChatRequest chatRequest = AiDtos.AiChatRequest.builder()
                    .message(prompt)
                    .context(documentText)
                    .systemPrompt("You are an HR Document Intelligence Assistant. Analyze the provided document context and answer user questions accurately.")
                    .build();

            return generateChatResponse(chatRequest);

        } catch (Exception ex) {
            log.error("Failed to read document for AI analysis", ex);
            throw new RuntimeException("Could not read uploaded document: " + ex.getMessage());
        }
    }

    /* Low-level HTTP call to Nvidia OpenAI-compatible REST API */
    private String callNvidiaApi(String model, String systemPrompt, String userMessage, String context) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        List<AiDtos.NvidiaMessage> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            messages.add(new AiDtos.NvidiaMessage("system", systemPrompt));
        }

        String fullMessage = userMessage;
        if (context != null && !context.trim().isEmpty()) {
            fullMessage = "--- DOCUMENT CONTEXT ---\n" + context + "\n--- USER QUESTION ---\n" + userMessage;
        }

        messages.add(new AiDtos.NvidiaMessage("user", fullMessage));

        AiDtos.NvidiaRequestPayload payload = AiDtos.NvidiaRequestPayload.builder()
                .model(model)
                .messages(messages)
                .temperature(0.5)
                .max_tokens(1024)
                .build();

        HttpEntity<AiDtos.NvidiaRequestPayload> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<AiDtos.NvidiaApiResponse> response = restTemplate.postForEntity(apiUrl, entity, AiDtos.NvidiaApiResponse.class);

        if (response.getBody() != null && response.getBody().getChoices() != null && !response.getBody().getChoices().isEmpty()) {
            return response.getBody().getChoices().get(0).getMessage().getContent();
        }

        throw new RuntimeException("Empty response payload from Nvidia AI API");
    }
}
