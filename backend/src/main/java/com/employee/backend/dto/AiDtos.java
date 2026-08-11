package com.employee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class AiDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiChatRequest {
        private String message;
        private String model;
        private String context;
        private String systemPrompt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AiChatResponse {
        private String reply;
        private String modelUsed;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeDetailRequest {
        private Long id;
    }

    /* Inner classes for mapping Nvidia API OpenAI format */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NvidiaMessage {
        private String role;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NvidiaRequestPayload {
        private String model;
        private List<NvidiaMessage> messages;
        private Double temperature;
        private Integer max_tokens;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NvidiaChoice {
        private NvidiaMessage message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NvidiaApiResponse {
        private String id;
        private List<NvidiaChoice> choices;
    }
}
