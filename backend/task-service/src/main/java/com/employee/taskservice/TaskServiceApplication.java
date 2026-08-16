package com.employee.taskservice;

import com.employee.taskservice.entity.TaskItem;
import com.employee.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableAsync
public class TaskServiceApplication {


    public static void main(String[] args) {
        SpringApplication.run(TaskServiceApplication.class, args);
    }

    @Component
    @RequiredArgsConstructor
    public static class TaskDataInitializer implements CommandLineRunner {

        private final TaskRepository taskRepository;

        @Override
        public void run(String... args) throws Exception {
            if (taskRepository.count() == 0) {
                taskRepository.save(TaskItem.builder()
                        .title("Configure Spring Cloud Gateway Routing")
                        .description("Set up microservices ingress routes, rate limiting, and CORS headers.")
                        .assigneeId(1L)
                        .assigneeName("Raman")
                        .department("IT")
                        .priority("HIGH")
                        .status("DONE")
                        .dueDate(LocalDateTime.now().plusDays(2))
                        .build());

                taskRepository.save(TaskItem.builder()
                        .title("Refactor Angular Component Core Modules")
                        .description("Migrate components into core, shared, and features modular structure.")
                        .assigneeId(2L)
                        .assigneeName("Ramesh")
                        .department("IT")
                        .priority("HIGH")
                        .status("IN_PROGRESS")
                        .dueDate(LocalDateTime.now().plusDays(4))
                        .build());

                taskRepository.save(TaskItem.builder()
                        .title("Review Nvidia AI Performance Evaluation Prompt")
                        .description("Optimize system prompt and verify multi-model fallback responses.")
                        .assigneeId(3L)
                        .assigneeName("Shyam Sundar")
                        .department("IT")
                        .priority("MEDIUM")
                        .status("TODO")
                        .dueDate(LocalDateTime.now().plusDays(5))
                        .build());
            }
        }
    }
}
