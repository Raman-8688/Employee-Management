package com.employee.projectknowledge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ProjectKnowledgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectKnowledgeApplication.class, args);
    }
}
