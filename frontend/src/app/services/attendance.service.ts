import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  totalHours?: number;
  breakHours?: number;
  overtimeHours?: number;
  status: 'Present' | 'Absent' | 'WFH' | 'Half-Day' | 'Leave';
  ipAddress?: string;
  locationTag?: string;
  overrideFlag?: boolean;
  lastModifiedBy?: string;
  overrideReason?: string;
}

export interface AttendanceAuditLog {
  id: number;
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  modifiedBy: string;
  modificationReason: string;
  oldStatus?: string;
  newStatus?: string;
  oldClockIn?: string;
  newClockIn?: string;
  oldClockOut?: string;
  newClockOut?: string;
  timestamp: string;
}

export interface AttendanceSummary {
  month: number;
  year: number;
  totalWorkingDays: number;
  averageWorkingHours: number;
  totalOvertimeHours: number;
  complianceRate: number;
  totalPresent: number;
  totalAbsent: number;
  totalWfh: number;
  totalLeave: number;
}

interface ApiResponse<T> {
  message: string;
  data: T;
  timeStamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private baseUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  getSummary(month?: number, year?: number): Observable<ApiResponse<AttendanceSummary>> {
    let params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.http.get<ApiResponse<AttendanceSummary>>(`${this.baseUrl}/summary`, { params });
  }

  getEmployeeAttendance(employeeId: number, month?: number, year?: number): Observable<ApiResponse<AttendanceRecord[]>> {
    let params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return this.http.get<ApiResponse<AttendanceRecord[]>>(`${this.baseUrl}/employee/${employeeId}`, { params });
  }

  clockIn(employeeId: number, locationTag?: string): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.baseUrl}/clock-in`, {
      employeeId,
      locationTag: locationTag || 'HQ - Main Office',
      ipAddress: '192.168.1.105'
    });
  }

  clockOut(employeeId: number, breakHours?: number): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.baseUrl}/clock-out`, {
      employeeId,
      breakHours: breakHours || 1.0
    });
  }

  overrideAttendance(id: number, payload: {
    status?: string;
    clockInTime?: string;
    clockOutTime?: string;
    modifiedBy?: string;
    modificationReason: string;
  }): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.put<ApiResponse<AttendanceRecord>>(`${this.baseUrl}/override/${id}`, payload);
  }

  getAuditLogs(employeeId?: number): Observable<ApiResponse<AttendanceAuditLog[]>> {
    let params: any = {};
    if (employeeId) params.employeeId = employeeId;
    return this.http.get<ApiResponse<AttendanceAuditLog[]>>(`${this.baseUrl}/audit-logs`, { params });
  }
}
