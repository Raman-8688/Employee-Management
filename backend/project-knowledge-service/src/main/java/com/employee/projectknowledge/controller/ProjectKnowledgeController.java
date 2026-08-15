package com.employee.projectknowledge.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.projectknowledge.entity.*;
import com.employee.projectknowledge.service.ProjectKnowledgeService;
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
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectKnowledgeController {

    private final ProjectKnowledgeService projectService;
    private static final String UPLOAD_DIR = "project-docs/";

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnterpriseProject>>> getProjects(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "domain", required = false) String domain,
            @RequestParam(value = "status", required = false) String status
    ) {
        List<EnterpriseProject> projects = projectService.searchProjects(query, domain, status);
        return ResponseEntity.ok(new ApiResponse<>("Projects fetched successfully", projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnterpriseProject>> getProjectById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(new ApiResponse<>("Project fetched successfully", projectService.getProjectById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EnterpriseProject>> createProject(@RequestBody EnterpriseProject project) {
        return ResponseEntity.ok(new ApiResponse<>("Project created successfully", projectService.createProject(project)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EnterpriseProject>> updateProject(@PathVariable("id") Long id, @RequestBody EnterpriseProject project) {
        return ResponseEntity.ok(new ApiResponse<>("Project updated successfully", projectService.updateProject(id, project)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable("id") Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(new ApiResponse<>("Project deleted successfully", null));
    }

    @PostMapping("/{projectId}/tech-stacks")
    public ResponseEntity<ApiResponse<ProjectTechStack>> addTechStack(@PathVariable("projectId") Long projectId, @RequestBody ProjectTechStack techStack) {
        return ResponseEntity.ok(new ApiResponse<>("Tech stack added successfully", projectService.addTechStack(projectId, techStack)));
    }

    @PostMapping("/{projectId}/db-schemas")
    public ResponseEntity<ApiResponse<ProjectDatabaseSchema>> addDatabaseSchema(@PathVariable("projectId") Long projectId, @RequestBody ProjectDatabaseSchema schema) {
        return ResponseEntity.ok(new ApiResponse<>("Database schema added successfully", projectService.addDatabaseSchema(projectId, schema)));
    }

    @PostMapping("/{projectId}/screens")
    public ResponseEntity<ApiResponse<ProjectScreenRegistry>> addScreenRegistry(@PathVariable("projectId") Long projectId, @RequestBody ProjectScreenRegistry screen) {
        return ResponseEntity.ok(new ApiResponse<>("Screen registry added successfully", projectService.addScreenRegistry(projectId, screen)));
    }

    @PostMapping("/{projectId}/api-endpoints")
    public ResponseEntity<ApiResponse<ProjectApiEndpoint>> addApiEndpoint(@PathVariable("projectId") Long projectId, @RequestBody ProjectApiEndpoint endpoint) {
        return ResponseEntity.ok(new ApiResponse<>("API endpoint added successfully", projectService.addApiEndpoint(projectId, endpoint)));
    }

    @PostMapping(value = "/{projectId}/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProjectDocument>> uploadDocument(
            @PathVariable("projectId") Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy
    ) {
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

            String fileUrl = "http://localhost:8080/project-docs/" + newFilename;
            String fileType = extension.replace(".", "").toUpperCase();
            if (fileType.isEmpty()) fileType = "PDF";

            ProjectDocument doc = ProjectDocument.builder()
                    .documentTitle(originalName != null ? originalName : "Project_Doc_" + newFilename)
                    .fileType(fileType)
                    .filePath(fileUrl)
                    .uploadedBy(uploadedBy != null && !uploadedBy.isEmpty() ? uploadedBy : "System User")
                    .uploadDate(LocalDateTime.now())
                    .build();

            ProjectDocument savedDoc = projectService.addDocument(projectId, doc);
            return ResponseEntity.ok(new ApiResponse<>("Project document uploaded successfully", savedDoc));
        } catch (Exception ex) {
            log.error("Failed to upload project document: {}", ex.getMessage(), ex);
            return ResponseEntity.status(500).body(new ApiResponse<>("Failed to upload document: " + ex.getMessage(), null));
        }
    }
}
