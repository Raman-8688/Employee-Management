import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import {
  ProjectKnowledgeService,
  EnterpriseProject,
  ProjectTechStack,
  ProjectDatabaseSchema,
  ProjectScreenRegistry,
  ProjectApiEndpoint,
  ProjectDocument
} from '../../services/project-knowledge.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project-knowledge',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './project-knowledge.component.html',
  styleUrls: ['./project-knowledge.component.css']
})
export class ProjectKnowledgeComponent implements OnInit {
  isLoading = true;
  projects: EnterpriseProject[] = [];
  selectedProject: EnterpriseProject | null = null;

  // View Mode: DIRECTORY | INSPECTOR | WIZARD
  activeViewMode: 'DIRECTORY' | 'INSPECTOR' | 'WIZARD' = 'DIRECTORY';

  // Inspector Active Tab: OVERVIEW | SCHEMAS | SCREENS | APIS | DOCUMENTS
  activeInspectorTab: 'OVERVIEW' | 'SCHEMAS' | 'SCREENS' | 'APIS' | 'DOCUMENTS' = 'OVERVIEW';

  // Search & Filter
  searchQuery = '';
  filterDomain = 'ALL';
  filterStatus = 'ALL';

  // New Tech Stack / DB Schema / Screen / API Forms
  showAddTechStackModal = false;
  newTechStack: ProjectTechStack = { category: 'FRONTEND', technologyName: '', version: '', notes: '' };

  showAddDbSchemaModal = false;
  newDbSchema: ProjectDatabaseSchema = { dbType: 'POSTGRESQL', tableName: '', tableDescription: '', columnsSummary: '', storedProceduresUsed: '' };

  showAddScreenModal = false;
  newScreen: ProjectScreenRegistry = { moduleName: '', screenName: '', submenuPath: '', componentsInvolved: '', description: '' };

  showAddApiModal = false;
  newApi: ProjectApiEndpoint = { httpMethod: 'GET', endpointUrl: '', controllerName: '', description: '' };

  showUploadDocModal = false;
  selectedDocFile: File | null = null;
  uploadedBy = '';

  // Registration Wizard Multi-Step Form
  wizardStep = 1;
  wizardProject: EnterpriseProject = {
    projectCode: '',
    projectName: '',
    description: '',
    clientName: '',
    industryDomain: 'AMS',
    status: 'ACTIVE'
  };

  userRole = '';
  currentUserName = 'System User';

  constructor(
    private projectService: ProjectKnowledgeService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userRole = user?.role || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_EMPLOYEE');
    if (user) {
      this.currentUserName = (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username) || 'User';
    }

    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        const v = params['view'].toUpperCase();
        if (['DIRECTORY', 'INSPECTOR', 'WIZARD'].includes(v)) {
          this.activeViewMode = v as any;
        }
      }
      if (params['tab']) {
        const t = params['tab'].toUpperCase();
        if (['OVERVIEW', 'SCHEMAS', 'SCREENS', 'APIS', 'DOCUMENTS'].includes(t)) {
          this.activeInspectorTab = t as any;
        }
      }
    });


    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects(this.searchQuery, this.filterDomain, this.filterStatus).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.projects = res.data;
        } else {
          this.projects = this.getMockProjects();
        }
        if (!this.selectedProject && this.projects.length > 0) {
          this.selectedProject = this.projects[0];
        }
        this.isLoading = false;
      },
      error: () => {
        this.projects = this.getMockProjects();
        if (!this.selectedProject && this.projects.length > 0) {
          this.selectedProject = this.projects[0];
        }
        this.isLoading = false;
      }
    });
  }

  selectProjectForInspector(project: EnterpriseProject): void {
    this.selectedProject = project;
    this.activeViewMode = 'INSPECTOR';
    this.activeInspectorTab = 'OVERVIEW';
  }

  switchViewMode(mode: 'DIRECTORY' | 'INSPECTOR' | 'WIZARD'): void {
    this.activeViewMode = mode;
  }

  // Add Child Entities
  submitTechStack(): void {
    if (!this.newTechStack.technologyName.trim() || !this.selectedProject?.id) return;
    this.projectService.addTechStack(this.selectedProject.id, this.newTechStack).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedProject) {
          if (!this.selectedProject.techStacks) this.selectedProject.techStacks = [];
          this.selectedProject.techStacks.push(res.data);
        }
        this.showAddTechStackModal = false;
      },
      error: () => {
        if (this.selectedProject) {
          if (!this.selectedProject.techStacks) this.selectedProject.techStacks = [];
          this.selectedProject.techStacks.push({ ...this.newTechStack, id: Date.now() });
        }
        this.showAddTechStackModal = false;
      }
    });
  }

  submitDbSchema(): void {
    if (!this.newDbSchema.tableName.trim() || !this.selectedProject?.id) return;
    this.projectService.addDatabaseSchema(this.selectedProject.id, this.newDbSchema).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedProject) {
          if (!this.selectedProject.dbSchemas) this.selectedProject.dbSchemas = [];
          this.selectedProject.dbSchemas.push(res.data);
        }
        this.showAddDbSchemaModal = false;
      },
      error: () => {
        if (this.selectedProject) {
          if (!this.selectedProject.dbSchemas) this.selectedProject.dbSchemas = [];
          this.selectedProject.dbSchemas.push({ ...this.newDbSchema, id: Date.now() });
        }
        this.showAddDbSchemaModal = false;
      }
    });
  }

  submitScreen(): void {
    if (!this.newScreen.screenName.trim() || !this.selectedProject?.id) return;
    this.projectService.addScreenRegistry(this.selectedProject.id, this.newScreen).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedProject) {
          if (!this.selectedProject.screens) this.selectedProject.screens = [];
          this.selectedProject.screens.push(res.data);
        }
        this.showAddScreenModal = false;
      },
      error: () => {
        if (this.selectedProject) {
          if (!this.selectedProject.screens) this.selectedProject.screens = [];
          this.selectedProject.screens.push({ ...this.newScreen, id: Date.now() });
        }
        this.showAddScreenModal = false;
      }
    });
  }

  submitApi(): void {
    if (!this.newApi.endpointUrl.trim() || !this.selectedProject?.id) return;
    this.projectService.addApiEndpoint(this.selectedProject.id, this.newApi).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedProject) {
          if (!this.selectedProject.apiEndpoints) this.selectedProject.apiEndpoints = [];
          this.selectedProject.apiEndpoints.push(res.data);
        }
        this.showAddApiModal = false;
      },
      error: () => {
        if (this.selectedProject) {
          if (!this.selectedProject.apiEndpoints) this.selectedProject.apiEndpoints = [];
          this.selectedProject.apiEndpoints.push({ ...this.newApi, id: Date.now() });
        }
        this.showAddApiModal = false;
      }
    });
  }

  onDocumentFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedDocFile = event.target.files[0];
    }
  }

  submitDocumentUpload(): void {
    if (!this.selectedDocFile || !this.selectedProject?.id) return;
    this.projectService.uploadDocument(this.selectedProject.id, this.selectedDocFile, this.currentUserName).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedProject) {
          if (!this.selectedProject.documents) this.selectedProject.documents = [];
          this.selectedProject.documents.push(res.data);
        }
        this.showUploadDocModal = false;
        this.selectedDocFile = null;
      },
      error: () => {
        if (this.selectedProject) {
          if (!this.selectedProject.documents) this.selectedProject.documents = [];
          this.selectedProject.documents.push({
            id: Date.now(),
            documentTitle: this.selectedDocFile?.name || 'Project_Doc',
            fileType: 'PDF',
            filePath: 'http://localhost:8080/project-docs/' + this.selectedDocFile?.name,
            uploadedBy: this.currentUserName,
            uploadDate: new Date().toISOString()
          });
        }
        this.showUploadDocModal = false;
        this.selectedDocFile = null;
      }
    });
  }

  // Wizard Multi-Step Controls
  nextWizardStep(): void {
    if (this.wizardStep === 1 && (!this.wizardProject.projectCode.trim() || !this.wizardProject.projectName.trim())) {
      alert('Please enter a Project Code and Project Name.');
      return;
    }
    if (this.wizardStep < 3) {
      this.wizardStep++;
    } else {
      this.submitWizardProject();
    }
  }

  prevWizardStep(): void {
    if (this.wizardStep > 1) {
      this.wizardStep--;
    }
  }

  submitWizardProject(): void {
    this.projectService.createProject(this.wizardProject).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.projects.push(res.data);
          this.selectProjectForInspector(res.data);
        }
        alert('Project onboarded successfully into Knowledge Hub!');
      },
      error: () => {
        const created: EnterpriseProject = {
          ...this.wizardProject,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        this.projects.push(created);
        this.selectProjectForInspector(created);
        alert('Project onboarded into Knowledge Hub!');
      }
    });
  }

  private getMockProjects(): EnterpriseProject[] {
    return [
      {
        id: 1,
        projectCode: 'PRJ-AMS-01',
        projectName: 'AMS - Enterprise Asset Management System',
        description: 'Full-lifecycle asset tracking platform managing hardware, software licenses, depreciation calculations, and audit compliance.',
        clientName: 'Global Infrastructure Corp',
        industryDomain: 'AMS',
        status: 'ACTIVE',
        createdAt: '2026-07-15T10:00:00',
        techStacks: [
          { id: 1, category: 'FRONTEND', technologyName: 'Angular', version: '17.3', notes: 'Standalone components' },
          { id: 2, category: 'BACKEND', technologyName: 'Spring Boot', version: '3.3.2', notes: 'Spring Cloud Microservices' },
          { id: 3, category: 'DATABASE', technologyName: 'PostgreSQL', version: '15.4', notes: 'Relational schema' },
          { id: 4, category: 'AI_INTEGRATION', technologyName: 'Nvidia Llama 3.1 8B', version: 'v1', notes: 'AI copilot assistance' }
        ],
        dbSchemas: [
          { id: 1, dbType: 'POSTGRESQL', schemaName: 'public', tableName: 'ams_assets', tableDescription: 'Core asset catalog', columnsSummary: 'id, serial_no, category, purchase_cost, status', storedProceduresUsed: 'sp_calculate_depreciation_v2' },
          { id: 2, dbType: 'POSTGRESQL', schemaName: 'public', tableName: 'ams_depreciation_ledger', tableDescription: 'Annual depreciation ledger', columnsSummary: 'id, asset_id, year, dep_amount', storedProceduresUsed: 'sp_audit_asset_life' }
        ],
        screens: [
          { id: 1, moduleName: 'Asset Operations', screenName: 'Asset Directory & Inspector', submenuPath: '/dashboard/ams/assets', componentsInvolved: 'AssetListComponent, AssetDetailModalComponent', description: 'Searchable grid with barcode scanner & transfer workflow' }
        ],
        apiEndpoints: [
          { id: 1, httpMethod: 'GET', endpointUrl: '/api/ams/assets', controllerName: 'AssetController', description: 'Fetches paginated list of enterprise assets' },
          { id: 2, httpMethod: 'POST', endpointUrl: '/api/ams/depreciation/calculate', controllerName: 'DepreciationController', description: 'Calculates asset depreciation' }
        ],
        documents: [
          { id: 1, documentTitle: 'AMS_Enterprise_Architecture_Blueprint.pdf', fileType: 'PDF', filePath: 'http://localhost:8080/project-docs/AMS_Blueprint.pdf', uploadedBy: 'Lead Architect', uploadDate: '2026-07-20T11:00:00' }
        ]
      },
      {
        id: 2,
        projectCode: 'PRJ-PHARMA-02',
        projectName: 'Pharma Clinical Research & Trial Suite',
        description: 'FDA-compliant trial management system handling patient consent, adverse effect tracking, and drug batch audits.',
        clientName: 'Apex LifeSciences Inc',
        industryDomain: 'PHARMA',
        status: 'ACTIVE',
        createdAt: '2026-07-01T09:00:00',
        techStacks: [
          { id: 5, category: 'FRONTEND', technologyName: 'React.js', version: '18.2', notes: 'Redux Toolkit & Tailwind' },
          { id: 6, category: 'BACKEND', technologyName: 'Spring Boot', version: '3.2.0', notes: 'Spring Security 6' },
          { id: 7, category: 'DATABASE', technologyName: 'Oracle', version: '19c', notes: 'Encrypted tablespaces' }
        ],
        dbSchemas: [
          { id: 3, dbType: 'ORACLE', schemaName: 'PHARMA_DB', tableName: 'pharma_clinical_trials', tableDescription: 'Clinical trial registry', columnsSummary: 'trial_id, phase, sample_size, fda_status', storedProceduresUsed: 'sp_fda_safety_audit' }
        ],
        screens: [
          { id: 2, moduleName: 'Clinical Trials', screenName: 'Trial Phase Manager', submenuPath: '/pharma/trials', componentsInvolved: 'TrialGridComponent', description: 'Manages Phase I-IV trial workflows' }
        ],
        apiEndpoints: [
          { id: 3, httpMethod: 'POST', endpointUrl: '/api/pharma/trials/audit', controllerName: 'ClinicalTrialController', description: 'Submits trial audit logs to FDA proxy' }
        ],
        documents: [
          { id: 2, documentTitle: 'Pharma_FDA_Compliance_Spec.pdf', fileType: 'PDF', filePath: 'http://localhost:8080/project-docs/Pharma_FDA_Spec.pdf', uploadedBy: 'Compliance Officer', uploadDate: '2026-07-10T14:00:00' }
        ]
      },
      {
        id: 3,
        projectCode: 'PRJ-CONST-03',
        projectName: 'Construction Site & Equipment ERP',
        description: 'Heavy construction ERP managing site progress, contractor billing, material inventory, and equipment dispatch.',
        clientName: 'BuildCon International',
        industryDomain: 'CONSTRUCTION',
        status: 'ACTIVE',
        createdAt: '2026-06-15T08:00:00',
        techStacks: [
          { id: 8, category: 'FRONTEND', technologyName: 'Vue.js', version: '3.3', notes: 'Pinia state & Vuetify' },
          { id: 9, category: 'BACKEND', technologyName: 'Spring Boot', version: '3.3.1', notes: 'Spring Batch' },
          { id: 10, category: 'DATABASE', technologyName: 'MySQL', version: '8.0', notes: 'InnoDB engine' }
        ],
        dbSchemas: [
          { id: 4, dbType: 'MYSQL', schemaName: 'construction_db', tableName: 'const_equipment_logs', tableDescription: 'Equipment dispatch logs', columnsSummary: 'id, equipment_name, site_id, fuel_liters', storedProceduresUsed: 'sp_calculate_site_cost_variance' }
        ],
        screens: [
          { id: 3, moduleName: 'Site Logistics', screenName: 'Equipment Dispatch Board', submenuPath: '/construction/equipment', componentsInvolved: 'EquipmentBoardComponent', description: 'Tracks heavy cranes and excavators' }
        ],
        apiEndpoints: [
          { id: 4, httpMethod: 'GET', endpointUrl: '/api/construction/sites', controllerName: 'SiteController', description: 'Fetches active construction site metrics' }
        ],
        documents: [
          { id: 3, documentTitle: 'Construction_ERP_Blueprint.docx', fileType: 'DOCX', filePath: 'http://localhost:8080/project-docs/Construction_ERP.docx', uploadedBy: 'Project Manager', uploadDate: '2026-06-25T16:00:00' }
        ]
      }
    ];
  }
}
