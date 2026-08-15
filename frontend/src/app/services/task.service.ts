import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubTask {
  id?: number;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id?: number;
  authorName: string;
  content: string;
  createdAt?: string;
}

export interface TaskTimeLog {
  id?: number;
  employeeId: number;
  employeeName?: string;
  hoursSpent: number;
  logDate?: string;
  description?: string;
}

export interface TaskItem {
  id?: number;
  title: string;
  description: string;
  taskType?: 'STORY' | 'BUG' | 'TASK' | 'EPIC';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatar?: string;
  department?: string;
  reporterName?: string;
  estimatedHours?: number;
  loggedHours?: number;
  tags?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  subTasks?: SubTask[];
  comments?: TaskComment[];
  timeLogs?: TaskTimeLog[];
}

export interface TaskLearning {
  id?: number;
  taskId?: number;
  taskTitle?: string;
  employeeId?: number;
  employeeName?: string;
  title: string;
  category: 'TECHNICAL' | 'ARCHITECTURE' | 'SECURITY' | 'PROCESS';
  content: string;
  attachmentUrl?: string;
  fileType?: string;
  createdAt?: string;
}

export interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  bugsSolved: number;
  totalHoursLogged7Days: number;
  velocityPercentage: number;
}

export interface EmployeeTaskAnalytics {
  employeeId: number;
  employeeName: string;
  totalAssignedTasks: number;
  completedTasks: number;
  bugsFixed: number;
  storiesCompleted: number;
  totalHoursLogged: number;
  completionRatePercentage: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
  timeStamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = `${environment.apiUrl}/api/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(filterParams?: {
    status?: string;
    taskType?: string;
    priority?: string;
    assigneeId?: number;
    department?: string;
  }): Observable<ApiResponse<TaskItem[]>> {
    let params = new HttpParams();
    if (filterParams) {
      if (filterParams.status) params = params.set('status', filterParams.status);
      if (filterParams.taskType) params = params.set('taskType', filterParams.taskType);
      if (filterParams.priority) params = params.set('priority', filterParams.priority);
      if (filterParams.assigneeId) params = params.set('assigneeId', filterParams.assigneeId.toString());
      if (filterParams.department) params = params.set('department', filterParams.department);
    }
    return this.http.get<ApiResponse<TaskItem[]>>(`${this.baseUrl}`, { params });
  }

  getMyTasks(assigneeId: number): Observable<ApiResponse<TaskItem[]>> {
    const params = new HttpParams().set('assigneeId', assigneeId.toString());
    return this.http.get<ApiResponse<TaskItem[]>>(`${this.baseUrl}/my-tasks`, { params });
  }

  getTaskById(id: number): Observable<ApiResponse<TaskItem>> {
    return this.http.get<ApiResponse<TaskItem>>(`${this.baseUrl}/${id}`);
  }

  createTask(task: TaskItem): Observable<ApiResponse<TaskItem>> {
    return this.http.post<ApiResponse<TaskItem>>(`${this.baseUrl}`, task);
  }

  updateTask(id: number, task: TaskItem, userId?: number, userRole?: string): Observable<ApiResponse<TaskItem>> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId.toString());
    if (userRole) params = params.set('userRole', userRole);
    return this.http.put<ApiResponse<TaskItem>>(`${this.baseUrl}/${id}`, task, { params });
  }

  updateTaskStatus(id: number, status: string, userId?: number, userRole?: string): Observable<ApiResponse<TaskItem>> {
    let params = new HttpParams().set('status', status);
    if (userId) params = params.set('userId', userId.toString());
    if (userRole) params = params.set('userRole', userRole);
    return this.http.patch<ApiResponse<TaskItem>>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  deleteTask(id: number, userId?: number, userRole?: string): Observable<ApiResponse<void>> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId.toString());
    if (userRole) params = params.set('userRole', userRole);
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { params });
  }

  // Subtasks
  addSubTask(taskId: number, title: string): Observable<ApiResponse<SubTask>> {
    return this.http.post<ApiResponse<SubTask>>(`${this.baseUrl}/${taskId}/subtasks`, { title });
  }

  toggleSubTask(subId: number): Observable<ApiResponse<SubTask>> {
    return this.http.patch<ApiResponse<SubTask>>(`${this.baseUrl}/subtasks/${subId}/toggle`, null);
  }

  deleteSubTask(subId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/subtasks/${subId}`);
  }

  // Comments
  addComment(taskId: number, authorName: string, content: string): Observable<ApiResponse<TaskComment>> {
    return this.http.post<ApiResponse<TaskComment>>(`${this.baseUrl}/${taskId}/comments`, { authorName, content });
  }

  getComments(taskId: number): Observable<ApiResponse<TaskComment[]>> {
    return this.http.get<ApiResponse<TaskComment[]>>(`${this.baseUrl}/${taskId}/comments`);
  }

  // Time Logs
  logTime(taskId: number, employeeId: number, hoursSpent: number, description: string): Observable<ApiResponse<TaskTimeLog>> {
    return this.http.post<ApiResponse<TaskTimeLog>>(`${this.baseUrl}/${taskId}/time-logs`, {
      employeeId,
      hoursSpent,
      description
    });
  }

  getTimeLogs(taskId: number): Observable<ApiResponse<TaskTimeLog[]>> {
    return this.http.get<ApiResponse<TaskTimeLog[]>>(`${this.baseUrl}/${taskId}/time-logs`);
  }

  // Analytics
  getSprintAnalytics(): Observable<ApiResponse<SprintMetrics>> {
    return this.http.get<ApiResponse<SprintMetrics>>(`${this.baseUrl}/analytics/sprint`);
  }

  getEmployeeAnalytics(employeeId: number): Observable<ApiResponse<EmployeeTaskAnalytics>> {
    return this.http.get<ApiResponse<EmployeeTaskAnalytics>>(`${this.baseUrl}/analytics/employee/${employeeId}`);
  }

  // Task Learnings & Best Practices
  getLearnings(category?: string, query?: string): Observable<ApiResponse<TaskLearning[]>> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (query) params = params.set('query', query);
    return this.http.get<ApiResponse<TaskLearning[]>>(`${this.baseUrl}/learnings`, { params });
  }

  createLearning(learning: TaskLearning): Observable<ApiResponse<TaskLearning>> {
    return this.http.post<ApiResponse<TaskLearning>>(`${this.baseUrl}/learnings`, learning);
  }

  uploadLearningAttachment(file: File): Observable<ApiResponse<{ url: string; fileUrl: string; fileType: string; originalName: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<{ url: string; fileUrl: string; fileType: string; originalName: string }>>(
      `${this.baseUrl}/learnings/upload`,
      formData
    );
  }
}
