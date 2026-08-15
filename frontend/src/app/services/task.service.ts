import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
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

  getAllTasks(): Observable<ApiResponse<TaskItem[]>> {
    return this.http.get<ApiResponse<TaskItem[]>>(`${this.baseUrl}`);
  }

  getTaskById(id: number): Observable<ApiResponse<TaskItem>> {
    return this.http.get<ApiResponse<TaskItem>>(`${this.baseUrl}/${id}`);
  }

  createTask(task: TaskItem): Observable<ApiResponse<TaskItem>> {
    return this.http.post<ApiResponse<TaskItem>>(`${this.baseUrl}`, task);
  }

  updateTask(id: number, task: TaskItem): Observable<ApiResponse<TaskItem>> {
    return this.http.put<ApiResponse<TaskItem>>(`${this.baseUrl}/${id}`, task);
  }

  updateTaskStatus(id: number, status: string): Observable<ApiResponse<TaskItem>> {
    return this.http.patch<ApiResponse<TaskItem>>(`${this.baseUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  deleteTask(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
