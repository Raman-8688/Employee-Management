package com.employee.projectknowledge.service;

import com.employee.projectknowledge.entity.*;
import com.employee.projectknowledge.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectKnowledgeService {

    private final EnterpriseProjectRepository projectRepository;
    private final ProjectTechStackRepository techStackRepository;
    private final ProjectDatabaseSchemaRepository dbSchemaRepository;
    private final ProjectScreenRegistryRepository screenRepository;
    private final ProjectApiEndpointRepository apiEndpointRepository;
    private final ProjectDocumentRepository documentRepository;

    @PostConstruct
    public void seedInitialProjects() {
        if (projectRepository.count() == 0) {
            log.info("Seeding initial Enterprise Projects into project_knowledge_db...");

            // Project 1: AMS Asset Management System
            EnterpriseProject ams = projectRepository.save(EnterpriseProject.builder()
                    .projectCode("PRJ-AMS-01")
                    .projectName("AMS - Enterprise Asset Management System")
                    .description("Full-lifecycle asset tracking platform managing hardware, software licenses, depreciation calculations, and audit compliance.")
                    .clientName("Global Infrastructure Corp")
                    .industryDomain("AMS")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now().minusDays(30))
                    .build());

            techStackRepository.save(ProjectTechStack.builder().category("FRONTEND").technologyName("Angular").version("17.3").notes("Standalone components & Material UI").project(ams).build());
            techStackRepository.save(ProjectTechStack.builder().category("BACKEND").technologyName("Spring Boot").version("3.3.2").notes("Spring Cloud Microservices & Feign Clients").project(ams).build());
            techStackRepository.save(ProjectTechStack.builder().category("DATABASE").technologyName("PostgreSQL").version("15.4").notes("Relational schema with JSONB support").project(ams).build());
            techStackRepository.save(ProjectTechStack.builder().category("DEVOPS").technologyName("Docker & Kubernetes").version("1.28").notes("Multi-stage containerization").project(ams).build());

            dbSchemaRepository.save(ProjectDatabaseSchema.builder()
                    .dbType("POSTGRESQL")
                    .schemaName("public")
                    .tableName("ams_assets")
                    .tableDescription("Core asset catalog storing serial numbers, lifecycle status, and valuation.")
                    .columnsSummary("id (BIGINT), serial_no (VARCHAR), category (VARCHAR), purchase_cost (NUMERIC), status (VARCHAR)")
                    .storedProceduresUsed("sp_calculate_depreciation_v2, sp_audit_asset_life")
                    .project(ams)
                    .build());

            screenRepository.save(ProjectScreenRegistry.builder()
                    .moduleName("Asset Operations")
                    .screenName("Asset Directory & Inspector")
                    .submenuPath("/dashboard/ams/assets")
                    .componentsInvolved("AssetListComponent, AssetDetailModalComponent")
                    .description("Searchable grid of company assets with barcode scanner & transfer workflow.")
                    .project(ams)
                    .build());

            apiEndpointRepository.save(ProjectApiEndpoint.builder()
                    .httpMethod("GET")
                    .endpointUrl("/api/ams/assets")
                    .controllerName("AssetController")
                    .description("Fetches paginated list of enterprise assets with status filters.")
                    .project(ams)
                    .build());

            documentRepository.save(ProjectDocument.builder()
                    .documentTitle("AMS_Enterprise_Architecture_Blueprint.pdf")
                    .fileType("PDF")
                    .filePath("http://localhost:8080/project-docs/AMS_Blueprint.pdf")
                    .uploadedBy("Lead Architect")
                    .uploadDate(LocalDateTime.now().minusDays(20))
                    .project(ams)
                    .build());

            // Project 2: Pharma Clinical Research & Trial Suite
            EnterpriseProject pharma = projectRepository.save(EnterpriseProject.builder()
                    .projectCode("PRJ-PHARMA-02")
                    .projectName("Pharma Clinical Research & Trial Suite")
                    .description("FDA-compliant trial management system handling patient consent, adverse effect tracking, and drug batch audits.")
                    .clientName("Apex LifeSciences Inc")
                    .industryDomain("PHARMA")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now().minusDays(45))
                    .build());

            techStackRepository.save(ProjectTechStack.builder().category("FRONTEND").technologyName("React.js").version("18.2").notes("Redux Toolkit & TailwindCSS").project(pharma).build());
            techStackRepository.save(ProjectTechStack.builder().category("BACKEND").technologyName("Spring Boot").version("3.2.0").notes("Spring Security 6 & OAuth2").project(pharma).build());
            techStackRepository.save(ProjectTechStack.builder().category("DATABASE").technologyName("Oracle").version("19c").notes("Encrypted tablespaces").project(pharma).build());

            dbSchemaRepository.save(ProjectDatabaseSchema.builder()
                    .dbType("ORACLE")
                    .schemaName("PHARMA_DB")
                    .tableName("pharma_clinical_trials")
                    .tableDescription("Clinical trial registry holding trial phase, target sample size, and FDA compliance status.")
                    .columnsSummary("trial_id (NUMBER), phase (VARCHAR2), sample_size (NUMBER), fda_status (VARCHAR2)")
                    .storedProceduresUsed("sp_fda_safety_audit, sp_calculate_trial_efficacy")
                    .project(pharma)
                    .build());

            screenRepository.save(ProjectScreenRegistry.builder()
                    .moduleName("Clinical Trials")
                    .screenName("Trial Phase Manager")
                    .submenuPath("/pharma/trials")
                    .componentsInvolved("TrialGridComponent, PatientConsentModal")
                    .description("Manages ongoing Phase I-IV trials with patient safety controls.")
                    .project(pharma)
                    .build());

            apiEndpointRepository.save(ProjectApiEndpoint.builder()
                    .httpMethod("POST")
                    .endpointUrl("/api/pharma/trials/audit")
                    .controllerName("ClinicalTrialController")
                    .description("Submits trial audit logs to FDA security proxy.")
                    .project(pharma)
                    .build());

            documentRepository.save(ProjectDocument.builder()
                    .documentTitle("Pharma_FDA_Compliance_Spec.pdf")
                    .fileType("PDF")
                    .filePath("http://localhost:8080/project-docs/Pharma_FDA_Spec.pdf")
                    .uploadedBy("Compliance Officer")
                    .uploadDate(LocalDateTime.now().minusDays(15))
                    .project(pharma)
                    .build());

            // Project 3: Construction Enterprise ERP
            EnterpriseProject construction = projectRepository.save(EnterpriseProject.builder()
                    .projectCode("PRJ-CONST-03")
                    .projectName("Construction Site & Equipment ERP")
                    .description("Heavy construction ERP managing site progress, contractor billing, material inventory, and equipment dispatch.")
                    .clientName("BuildCon International")
                    .industryDomain("CONSTRUCTION")
                    .status("ACTIVE")
                    .createdAt(LocalDateTime.now().minusDays(60))
                    .build());

            techStackRepository.save(ProjectTechStack.builder().category("FRONTEND").technologyName("Vue.js").version("3.3").notes("Pinia state management & Vuetify").project(construction).build());
            techStackRepository.save(ProjectTechStack.builder().category("BACKEND").technologyName("Spring Boot").version("3.3.1").notes("Spring Batch for material import").project(construction).build());
            techStackRepository.save(ProjectTechStack.builder().category("DATABASE").technologyName("MySQL").version("8.0").notes("InnoDB storage engine").project(construction).build());

            dbSchemaRepository.save(ProjectDatabaseSchema.builder()
                    .dbType("MYSQL")
                    .schemaName("construction_db")
                    .tableName("const_equipment_logs")
                    .tableDescription("Real-time equipment dispatch & fuel consumption logs.")
                    .columnsSummary("id (BIGINT), equipment_name (VARCHAR), site_id (BIGINT), fuel_liters (DECIMAL)")
                    .storedProceduresUsed("sp_calculate_site_cost_variance")
                    .project(construction)
                    .build());

            screenRepository.save(ProjectScreenRegistry.builder()
                    .moduleName("Site Logistics")
                    .screenName("Equipment Dispatch Board")
                    .submenuPath("/construction/equipment")
                    .componentsInvolved("EquipmentBoardComponent, MaintenanceLogComponent")
                    .description("Tracks heavy excavators and cranes across active build sites.")
                    .project(construction)
                    .build());

            apiEndpointRepository.save(ProjectApiEndpoint.builder()
                    .httpMethod("GET")
                    .endpointUrl("/api/construction/sites")
                    .controllerName("SiteController")
                    .description("Fetches active construction site metrics and budget variance.")
                    .project(construction)
                    .build());

            documentRepository.save(ProjectDocument.builder()
                    .documentTitle("Construction_ERP_Blueprint.docx")
                    .fileType("DOCX")
                    .filePath("http://localhost:8080/project-docs/Construction_ERP.docx")
                    .uploadedBy("Project Manager")
                    .uploadDate(LocalDateTime.now().minusDays(25))
                    .project(construction)
                    .build());
        }
    }

    public List<EnterpriseProject> searchProjects(String query, String domain, String status) {
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String d = (domain != null && !domain.trim().isEmpty() && !"ALL".equalsIgnoreCase(domain)) ? domain.toUpperCase() : null;
        String s = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.toUpperCase() : null;
        return projectRepository.searchProjects(q, d, s);
    }

    public EnterpriseProject getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
    }

    @Transactional
    public EnterpriseProject createProject(EnterpriseProject project) {
        return projectRepository.save(project);
    }

    @Transactional
    public EnterpriseProject updateProject(Long id, EnterpriseProject updated) {
        EnterpriseProject existing = getProjectById(id);
        existing.setProjectName(updated.getProjectName());
        existing.setDescription(updated.getDescription());
        existing.setClientName(updated.getClientName());
        existing.setIndustryDomain(updated.getIndustryDomain());
        existing.setStatus(updated.getStatus());
        return projectRepository.save(existing);
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    @Transactional
    public ProjectTechStack addTechStack(Long projectId, ProjectTechStack techStack) {
        EnterpriseProject project = getProjectById(projectId);
        techStack.setProject(project);
        return techStackRepository.save(techStack);
    }

    @Transactional
    public ProjectDatabaseSchema addDatabaseSchema(Long projectId, ProjectDatabaseSchema schema) {
        EnterpriseProject project = getProjectById(projectId);
        schema.setProject(project);
        return dbSchemaRepository.save(schema);
    }

    @Transactional
    public ProjectScreenRegistry addScreenRegistry(Long projectId, ProjectScreenRegistry screen) {
        EnterpriseProject project = getProjectById(projectId);
        screen.setProject(project);
        return screenRepository.save(screen);
    }

    @Transactional
    public ProjectApiEndpoint addApiEndpoint(Long projectId, ProjectApiEndpoint endpoint) {
        EnterpriseProject project = getProjectById(projectId);
        endpoint.setProject(project);
        return apiEndpointRepository.save(endpoint);
    }

    @Transactional
    public ProjectDocument addDocument(Long projectId, ProjectDocument doc) {
        EnterpriseProject project = getProjectById(projectId);
        doc.setProject(project);
        return documentRepository.save(doc);
    }
}
