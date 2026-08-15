package com.employee.taskservice.service;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import com.employee.taskservice.client.EmployeeClient;
import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.entity.TaskLearning;
import com.employee.taskservice.repository.TaskLearningRepository;
import com.employee.taskservice.repository.TaskRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskLearningService {

    private final TaskLearningRepository learningRepository;
    private final TaskRepository taskRepository;
    private final EmployeeClient employeeClient;

    @PostConstruct
    public void seedInitialLearnings() {
        if (learningRepository.count() == 0) {
            log.info("Seeding initial Task Learnings & Best Practices...");

            learningRepository.save(TaskLearning.builder()
                    .taskId(1L)
                    .taskTitle("Configure Spring Cloud Gateway Dynamic Ingress")
                    .employeeId(1L)
                    .employeeName("Raman")
                    .title("Header Deduplication Filter Syntax in Gateway 4.1+")
                    .category("ARCHITECTURE")
                    .content("When configuring CORS in Spring Cloud Gateway alongside controller CORS annotations, duplicate headers trigger ERR_FAILED. Centralizing CORS in Gateway globalcors and removing controller @CrossOrigin prevents duplicate Access-Control-Allow-Origin headers.")
                    .fileType("PDF")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build());

            learningRepository.save(TaskLearning.builder()
                    .taskId(4L)
                    .taskTitle("Fix CORS Preflight Headers on Auth Controller")
                    .employeeId(1L)
                    .employeeName("Raman")
                    .title("Handling OPTIONS Preflight Requests in Spring Security")
                    .category("SECURITY")
                    .content("Always configure requestMatchers(HttpMethod.OPTIONS, \"/**\").permitAll() in SecurityFilterChain. This ensures preflight OPTIONS requests pass without 403 Forbidden before Authorization headers are validated.")
                    .fileType("DOCX")
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .build());

            learningRepository.save(TaskLearning.builder()
                    .taskId(3L)
                    .taskTitle("Integrate Nvidia Llama 3.1 8B AI Engine")
                    .employeeId(3L)
                    .employeeName("Shyam Sundar")
                    .title("Multi-Model Resilient Fallback Strategy for LLM APIs")
                    .category("TECHNICAL")
                    .content("External LLM APIs can hit rate limits or 429 quota exhaustion. Implement fallback model lists (meta/llama-3.1-70b-instruct, mistralai/mistral-7b-instruct-v0.2) and local MNC HR fallback text generators to ensure 100% uptime for end users.")
                    .fileType("PNG")
                    .createdAt(LocalDateTime.now().minusHours(12))
                    .build());
        }
    }

    public TaskLearning createLearning(Long taskId, Long employeeId, String authorName, String title, String category, String content, String attachmentUrl, String fileType) {
        String empName = authorName;
        String taskTitle = "General Lesson";

        if (taskId != null) {
            TaskItem task = taskRepository.findById(taskId).orElse(null);
            if (task != null) {
                taskTitle = task.getTitle();
            }
        }

        if (employeeId != null && (empName == null || empName.isEmpty())) {
            try {
                ApiResponse<EmployeeDto> response = employeeClient.getEmployeeById(employeeId);
                if (response != null && response.getData() != null) {
                    empName = response.getData().getName();
                }
            } catch (Exception e) {
                log.warn("Could not fetch employee name for learning: {}", e.getMessage());
            }
        }

        TaskLearning learning = TaskLearning.builder()
                .taskId(taskId)
                .taskTitle(taskTitle)
                .employeeId(employeeId)
                .employeeName(empName != null && !empName.isEmpty() ? empName : "System User")
                .title(title)
                .category(category != null ? category.toUpperCase() : "TECHNICAL")
                .content(content)
                .attachmentUrl(attachmentUrl)
                .fileType(fileType)
                .createdAt(LocalDateTime.now())
                .build();

        return learningRepository.save(learning);
    }

    public List<TaskLearning> searchLearnings(String category, String query) {
        String cat = (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) ? category.toUpperCase() : null;
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        return learningRepository.searchLearnings(cat, q);
    }

    public TaskLearning getLearningById(Long id) {
        return learningRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning not found with id: " + id));
    }
}
