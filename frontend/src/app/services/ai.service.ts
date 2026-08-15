import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiChatRequest {
  message: string;
  model?: string;
  context?: string;
  systemPrompt?: string;
}

export interface AiChatResponse {
  reply: string;
  modelUsed: string;
  timestamp: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
  timeStamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private baseUrl = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  chat(request: AiChatRequest): Observable<ApiResponse<AiChatResponse>> {
    return this.http.post<ApiResponse<AiChatResponse>>(`${this.baseUrl}/chat`, request);
  }

  generatePerformanceReview(employeeId: number): Observable<ApiResponse<AiChatResponse>> {
    return this.http.post<ApiResponse<AiChatResponse>>(`${this.baseUrl}/performance-review`, { id: employeeId });
  }

  analyzeDocument(file: File, question?: string): Observable<ApiResponse<AiChatResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (question) {
      formData.append('question', question);
    }
    return this.http.post<ApiResponse<AiChatResponse>>(`${this.baseUrl}/analyze-document`, formData);
  }

  getAvailableModels(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/models`);
  }
}
