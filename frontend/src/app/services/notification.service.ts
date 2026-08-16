import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface NotificationItem {
  id?: number;
  recipientId: number;
  recipientEmail?: string;
  title: string;
  message: string;
  category: 'TASK' | 'SYSTEM' | 'HR' | 'ALERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'SENT' | 'FAILED';
  errorMessage?: string;
  readStatus?: boolean;
  createdAt?: string;
  sentAt?: string;
}

export interface NotificationMetrics {
  sentCount: number;
  pendingCount: number;
  failedCount: number;
  totalCount: number;
  deliverySuccessRate: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
  timeStamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = `${environment.apiUrl}/api/notifications`;

  private unreadCountSubject = new BehaviorSubject<number>(3);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Auto-polling every 10 seconds to update unread badge counter
    interval(10000)
      .pipe(
        switchMap(() => this.getUnreadCount(1).pipe(catchError(() => of({ data: 3 } as any))))
      )
      .subscribe((res) => {
        if (res && res.data !== undefined) {
          this.unreadCountSubject.next(res.data);
        }
      });
  }

  getUserNotifications(userId: number, category?: string, unreadOnly?: boolean): Observable<ApiResponse<NotificationItem[]>> {
    let params = new HttpParams();
    if (category && category !== 'ALL') params = params.set('category', category);
    if (unreadOnly) params = params.set('unreadOnly', 'true');

    return this.http.get<ApiResponse<NotificationItem[]>>(`${this.baseUrl}/user/${userId}`, { params });
  }

  getUnreadCount(userId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.baseUrl}/user/${userId}/unread-count`).pipe(
      map((res) => {
        if (res && res.data !== undefined) {
          this.unreadCountSubject.next(res.data);
        }
        return res;
      })
    );
  }

  markAsRead(id: number): Observable<ApiResponse<NotificationItem>> {
    return this.http.patch<ApiResponse<NotificationItem>>(`${this.baseUrl}/${id}/read`, {}).pipe(
      map((res) => {
        const current = this.unreadCountSubject.value;
        if (current > 0) this.unreadCountSubject.next(current - 1);
        return res;
      })
    );
  }

  markAllAsRead(userId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/user/${userId}/read-all`, {}).pipe(
      map((res) => {
        this.unreadCountSubject.next(0);
        return res;
      })
    );
  }

  deleteNotification(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  dispatchNotification(notification: NotificationItem): Observable<ApiResponse<NotificationItem>> {
    return this.http.post<ApiResponse<NotificationItem>>(`${this.baseUrl}/dispatch`, notification);
  }

  getMetrics(): Observable<ApiResponse<NotificationMetrics>> {
    return this.http.get<ApiResponse<NotificationMetrics>>(`${this.baseUrl}/metrics`);
  }
}
