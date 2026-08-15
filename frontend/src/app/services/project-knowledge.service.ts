import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProjectTechStack {
  id?: number;
  category: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'AI_INTEGRATION';
  technologyName: string;
  version?: string;
  notes?: string;
}

export interface ProjectDatabaseSchema {
  id?: number;
  dbType: 'POSTGRESQL' | 'MYSQL' | 'ORACLE' | 'MONGODB';
  schemaName?: string;
  tableName: string;
  tableDescription?: string;
  columnsSummary?: string;
  storedProceduresUsed?: string;
}

export interface ProjectScreenRegistry {
  id?: number;
  moduleName: string;
  screenName: string;
  submenuPath?: string;
  componentsInvolved?: string;
  description?: string;
}

export interface ProjectApiEndpoint {
  id?: number;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpointUrl: string;
  controllerName?: string;
  description?: string;
}

export interface ProjectDocument {
  id?: number;
  documentTitle: string;
  fileType: 'PDF' | 'DOCX' | 'ZIP' | 'IMAGE';
  filePath: string;
  uploadedBy?: string;
  uploadDate?: string;
}

export interface EnterpriseProject {
  id?: number;
  projectCode: string;
  projectName: string;
  description: string;
  clientName?: string;
  industryDomain: 'AMS' | 'PHARMA' | 'CONSTRUCTION' | 'GENERAL';
  status: 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED';
  createdAt?: string;
  techStacks?: ProjectTechStack[];
  dbSchemas?: ProjectDatabaseSchema[];
  screens?: ProjectScreenRegistry[];
  apiEndpoints?: ProjectApiEndpoint[];
  documents?: ProjectDocument[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
  timeStamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectKnowledgeService {
  private baseUrl = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient) {}

  getProjects(query?: string, domain?: string, status?: string): Observable<ApiResponse<EnterpriseProject[]>> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (domain) params = params.set('domain', domain);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<EnterpriseProject[]>>(`${this.baseUrl}`, { params });
  }

  getProjectById(id: number): Observable<ApiResponse<EnterpriseProject>> {
    return this.http.get<ApiResponse<EnterpriseProject>>(`${this.baseUrl}/${id}`);
  }

  createProject(project: EnterpriseProject): Observable<ApiResponse<EnterpriseProject>> {
    return this.http.post<ApiResponse<EnterpriseProject>>(`${this.baseUrl}`, project);
  }

  updateProject(id: number, project: EnterpriseProject): Observable<ApiResponse<EnterpriseProject>> {
    return this.http.put<ApiResponse<EnterpriseProject>>(`${this.baseUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  addTechStack(projectId: number, techStack: ProjectTechStack): Observable<ApiResponse<ProjectTechStack>> {
    return this.http.post<ApiResponse<ProjectTechStack>>(`${this.baseUrl}/${projectId}/tech-stacks`, techStack);
  }

  addDatabaseSchema(projectId: number, schema: ProjectDatabaseSchema): Observable<ApiResponse<ProjectDatabaseSchema>> {
    return this.http.post<ApiResponse<ProjectDatabaseSchema>>(`${this.baseUrl}/${projectId}/db-schemas`, schema);
  }

  addScreenRegistry(projectId: number, screen: ProjectScreenRegistry): Observable<ApiResponse<ProjectScreenRegistry>> {
    return this.http.post<ApiResponse<ProjectScreenRegistry>>(`${this.baseUrl}/${projectId}/screens`, screen);
  }

  addApiEndpoint(projectId: number, endpoint: ProjectApiEndpoint): Observable<ApiResponse<ProjectApiEndpoint>> {
    return this.http.post<ApiResponse<ProjectApiEndpoint>>(`${this.baseUrl}/${projectId}/api-endpoints`, endpoint);
  }

  uploadDocument(projectId: number, file: File, uploadedBy?: string): Observable<ApiResponse<ProjectDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    if (uploadedBy) formData.append('uploadedBy', uploadedBy);

    return this.http.post<ApiResponse<ProjectDocument>>(`${this.baseUrl}/${projectId}/documents/upload`, formData);
  }
}
