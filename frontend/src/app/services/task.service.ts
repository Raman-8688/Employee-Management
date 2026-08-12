import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskItem {
  id?: number;
  title: string;
  description: string;
  assigneeId?: number;
  assigneeName?: string;
  assigneeAvatar?: string;
  department?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
  createdAt?: string;
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
  private baseUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<ApiResponse<TaskItem[]>> {
    return this.http.get<ApiResponse<TaskItem[]>>(`${this.baseUrl}`);
  }

  createTask(task: TaskItem): Observable<ApiResponse<TaskItem>> {
    return this.http.post<ApiResponse<TaskItem>>(`${this.baseUrl}`, task);
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
