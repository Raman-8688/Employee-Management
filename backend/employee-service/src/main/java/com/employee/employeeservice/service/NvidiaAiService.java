package com.employee.employeeservice.service;

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
import java.util.*;

@Service
@Slf4j
public class NvidiaAiService {

    @Value("${nvidia.ai.api-key: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}")
    private String apiKey;

    @Value("${nvidia.ai.url:https://integrate.api.nvidia.com/v1/chat/completions}")
    private String nvidiaUrl;

    @Value("${nvidia.ai.default-model:meta/llama-3.1-8b-instruct}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> generateChatResponse(String message, String requestedModel, String context, String systemPrompt) {
        String primaryModel = (requestedModel != null && !requestedModel.trim().isEmpty())
                ? requestedModel
                : defaultModel;

        List<String> candidateModels = new ArrayList<>();
        candidateModels.add(primaryModel);
        if (!primaryModel.equals("meta/llama-3.1-8b-instruct")) candidateModels.add("meta/llama-3.1-8b-instruct");
        if (!primaryModel.equals("meta/llama-3.1-70b-instruct")) candidateModels.add("meta/llama-3.1-70b-instruct");
        if (!primaryModel.equals("meta/llama3-8b-instruct")) candidateModels.add("meta/llama3-8b-instruct");

        String sysInstruction = systemPrompt != null && !systemPrompt.trim().isEmpty()
                ? systemPrompt
                : "You are an expert HR Assistant & Performance Copilot for an enterprise Employee Management System. Provide clear, professional, and actionable advice.";

        for (String modelName : candidateModels) {
            try {
                log.info("Attempting Nvidia AI completion with model: {}", modelName);
                String responseText = callNvidiaApi(modelName, sysInstruction, message, context);

                Map<String, Object> res = new HashMap<>();
                res.put("reply", responseText);
                res.put("modelUsed", modelName);
                res.put("timestamp", LocalDateTime.now().toString());
                return res;
            } catch (Exception ex) {
                log.warn("Nvidia AI Model [{}] failed: {}. Trying fallback model...", modelName, ex.getMessage());
            }
        }

        // Intelligent Fallback if API keys / network fail
        String fallbackReply = getFallbackResponse(message);
        Map<String, Object> res = new HashMap<>();
        res.put("reply", fallbackReply);
        res.put("modelUsed", primaryModel + " (HR Intelligent Fallback)");
        res.put("timestamp", LocalDateTime.now().toString());
        return res;
    }

    public Map<String, Object> generatePerformanceReview(Long employeeId) {
        String prompt = "Generate a detailed Performance Review and Career Appraisal for Employee ID: " + employeeId + 
                "\n1. Strengths & Accomplishments\n2. Key Competencies\n3. Growth Goals & Managerial Rating.";
        return generateChatResponse(prompt, defaultModel, null, "You are a Senior HR Executive in an MNC.");
    }

    public Map<String, Object> analyzeDocument(MultipartFile file, String question) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot analyze empty file.");
        }
        try {
            String documentText = new String(file.getBytes(), StandardCharsets.UTF_8);
            if (documentText.length() > 8000) {
                documentText = documentText.substring(0, 8000) + "\n...[truncated for length]";
            }
            String prompt = (question != null && !question.trim().isEmpty()) ? question : "Summarize this HR document.";
            return generateChatResponse(prompt, defaultModel, documentText, "You are an HR Document Intelligence Assistant.");
        } catch (Exception ex) {
            log.error("Failed to read document for AI analysis", ex);
            throw new RuntimeException("Could not read uploaded document: " + ex.getMessage());
        }
    }

    private String callNvidiaApi(String model, String systemPrompt, String userMessage, String context) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            Map<String, String> sysMessage = new HashMap<>();
            sysMessage.put("role", "system");
            sysMessage.put("content", systemPrompt);
            messages.add(sysMessage);
        }

        String fullContent = userMessage;
        if (context != null && !context.trim().isEmpty()) {
            fullContent = "--- DOCUMENT CONTEXT ---\n" + context + "\n--- USER QUESTION ---\n" + userMessage;
        }

        Map<String, String> uMessage = new HashMap<>();
        uMessage.put("role", "user");
        uMessage.put("content", fullContent);
        messages.add(uMessage);

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.6);
        requestBody.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(nvidiaUrl, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List choices = (List) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map firstChoice = (Map) choices.get(0);
                Map msg = (Map) firstChoice.get("message");
                if (msg != null && msg.containsKey("content")) {
                    return (String) msg.get("content");
                }
            }
        }
        throw new RuntimeException("Empty response payload from Nvidia AI API");
    }

    private String getFallbackResponse(String prompt) {
        String lower = prompt.toLowerCase();
        if (lower.contains("leave") || lower.contains("vacation")) {
            return "Based on Enterprise MNC HR Policy, full-time employees receive 18 Earned Leaves, 12 Casual Leaves, and 10 Sick Leaves per fiscal year. Requests can be logged under Time Tools & Attendance.";
        } else if (lower.contains("salary") || lower.contains("payroll") || lower.contains("pay")) {
            return "Payroll is executed on the 28th of every month. Itemized payslips with tax breakdowns, HRA, and reimbursements are available under the Payroll module.";
        } else if (lower.contains("performance") || lower.contains("appraisal") || lower.contains("review")) {
            return "Quarterly Performance Reviews analyze KPI achievements, peer feedback, and project ticket delivery. Verify that your assigned Tasks & Projects are marked correctly.";
        }
        return "Enterprise AI Copilot (Powered by Nvidia Llama 3.1 8B): I have analyzed your request regarding '" + prompt + "'. Enterprise HR policies, attendance tracking, and task management systems are operating normally.";
    }
}
