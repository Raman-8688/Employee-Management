import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AttendanceService, AttendanceRecord, AttendanceAuditLog, AttendanceSummary } from '../../services/attendance.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-time-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './time-tools.component.html',
  styleUrls: ['./time-tools.component.css']
})
export class TimeToolsComponent implements OnInit {
  isLoading = true;
  activeTab: 'calendar' | 'audit' = 'calendar';

  // Summary Metrics
  summary: AttendanceSummary = {
    month: 8,
    year: 2026,
    totalWorkingDays: 22,
    averageWorkingHours: 8.4,
    totalOvertimeHours: 42.5,
    complianceRate: 96.5,
    totalPresent: 18,
    totalAbsent: 1,
    totalWfh: 2,
    totalLeave: 1
  };

  // Clock Widget State
  isClockedIn = false;
  clockInTime: Date | null = null;
  currentUser: any;

  // Attendance Records & Filters
  attendanceRecords: AttendanceRecord[] = [];
  filteredRecords: AttendanceRecord[] = [];
  auditLogs: AttendanceAuditLog[] = [];

  // Filter Models
  searchQuery = '';
  filterDepartment = '';
  filterStatus = '';
  selectedMonth = 8;
  selectedYear = 2026;

  months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' }, { value: 3, name: 'March' },
    { value: 4, name: 'April' }, { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' }, { value: 9, name: 'September' },
    { value: 10, name: 'October' }, { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  years = [2025, 2026, 2027];
  departments: string[] = ['IT', 'Operations', 'HR', 'Finance', 'Sales'];

  // Admin Override Modal State
  showOverrideModal = false;
  selectedOverrideRecord: AttendanceRecord | null = null;
  overrideStatus = 'Present';
  overrideClockIn = '';
  overrideClockOut = '';
  overrideReason = '';

  constructor(
    private attendanceService: AttendanceService,
    private confirmDialogService: ConfirmDialogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Fetch Monthly Summary
    this.attendanceService.getSummary(this.selectedMonth, this.selectedYear).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.summary = res.data;
        }
      },
      error: () => {}
    });

    // Fetch Attendance Records
    const empId = this.currentUser?.id || 1;
    this.attendanceService.getEmployeeAttendance(empId, this.selectedMonth, this.selectedYear).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.attendanceRecords = res.data;
        } else {
          this.attendanceRecords = this.getMockAttendanceRecords();
        }
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.attendanceRecords = this.getMockAttendanceRecords();
        this.applyFilters();
        this.isLoading = false;
      }
    });

    // Fetch Audit Logs
    this.attendanceService.getAuditLogs().subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.auditLogs = res.data;
        } else {
          this.auditLogs = this.getMockAuditLogs();
        }
      },
      error: () => {
        this.auditLogs = this.getMockAuditLogs();
      }
    });
  }

  applyFilters(): void {
    this.filteredRecords = this.attendanceRecords.filter(record => {
      const matchesSearch = !this.searchQuery ||
        record.employeeName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.employeeId.toString().includes(this.searchQuery);

      const matchesDept = !this.filterDepartment || record.department === this.filterDepartment;
      const matchesStatus = !this.filterStatus || record.status === this.filterStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterDepartment = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  toggleClockIn(): void {
    const empId = this.currentUser?.id || 1;

    if (!this.isClockedIn) {
      // Clock In
      this.attendanceService.clockIn(empId, 'HQ - Main Office').subscribe({
        next: (res) => {
          this.isClockedIn = true;
          this.clockInTime = new Date();
          this.loadData();
        },
        error: (err) => {
          this.isClockedIn = true;
          this.clockInTime = new Date();
        }
      });
    } else {
      // Clock Out
      this.attendanceService.clockOut(empId, 1.0).subscribe({
        next: (res) => {
          this.isClockedIn = false;
          this.clockInTime = null;
          this.loadData();
        },
        error: (err) => {
          this.isClockedIn = false;
          this.clockInTime = null;
        }
      });
    }
  }

  // Admin Override Modal Handlers
  openOverrideModal(record: AttendanceRecord): void {
    this.selectedOverrideRecord = record;
    this.overrideStatus = record.status;
    this.overrideClockIn = record.clockInTime ? record.clockInTime.substring(11, 16) : '09:00';
    this.overrideClockOut = record.clockOutTime ? record.clockOutTime.substring(11, 16) : '18:00';
    this.overrideReason = '';
    this.showOverrideModal = true;
  }

  closeOverrideModal(): void {
    this.showOverrideModal = false;
    this.selectedOverrideRecord = null;
  }

  submitOverride(): void {
    if (!this.selectedOverrideRecord || !this.overrideReason.trim()) {
      alert('Please enter a valid modification reason for the audit log.');
      return;
    }

    const rec = this.selectedOverrideRecord;
    const adminName = this.currentUser ? `${this.currentUser.firstName} ${this.currentUser.lastName}` : 'Admin';

    this.attendanceService.overrideAttendance(rec.id, {
      status: this.overrideStatus,
      modifiedBy: adminName,
      modificationReason: this.overrideReason
    }).subscribe({
      next: (res) => {
        this.closeOverrideModal();
        this.loadData();
      },
      error: (err) => {
        // Update local object
        rec.status = this.overrideStatus as any;
        rec.overrideFlag = true;
        rec.overrideReason = this.overrideReason;
        rec.lastModifiedBy = adminName;

        this.auditLogs.unshift({
          id: this.auditLogs.length + 1,
          attendanceId: rec.id,
          employeeId: rec.employeeId,
          employeeName: rec.employeeName,
          modifiedBy: adminName,
          modificationReason: this.overrideReason,
          oldStatus: 'Present',
          newStatus: this.overrideStatus,
          timestamp: new Date().toISOString()
        });

        this.closeOverrideModal();
        this.applyFilters();
      }
    });
  }

  private getMockAttendanceRecords(): AttendanceRecord[] {
    return [
      { id: 101, employeeId: 1, employeeName: 'Raman', department: 'IT', date: '2026-08-11', clockInTime: '2026-08-11T09:00:00', clockOutTime: '2026-08-11T18:00:00', totalHours: 8.0, breakHours: 1.0, overtimeHours: 0.0, status: 'Present', ipAddress: '192.168.1.100', locationTag: 'HQ - Main Office', overrideFlag: false },
      { id: 102, employeeId: 2, employeeName: 'Ramesh', department: 'IT', date: '2026-08-11', clockInTime: '2026-08-11T09:15:00', clockOutTime: '2026-08-11T18:30:00', totalHours: 8.25, breakHours: 1.0, overtimeHours: 0.25, status: 'Present', ipAddress: '192.168.1.102', locationTag: 'HQ - Main Office', overrideFlag: false },
      { id: 103, employeeId: 3, employeeName: 'Shyam Sundar', department: 'IT', date: '2026-08-11', clockInTime: '2026-08-11T08:30:00', clockOutTime: '2026-08-11T17:30:00', totalHours: 8.0, breakHours: 1.0, overtimeHours: 0.0, status: 'WFH', ipAddress: '172.16.0.45', locationTag: 'Remote - Bangalore', overrideFlag: true, lastModifiedBy: 'Admin', overrideReason: 'Approved Remote WFH' },
      { id: 104, employeeId: 4, employeeName: 'Vikash', department: 'Operations', date: '2026-08-11', clockInTime: '2026-08-11T09:00:00', clockOutTime: '2026-08-11T13:00:00', totalHours: 4.0, breakHours: 0.0, overtimeHours: 0.0, status: 'Half-Day', ipAddress: '192.168.1.110', locationTag: 'HQ - Main Office', overrideFlag: false }
    ];
  }

  private getMockAuditLogs(): AttendanceAuditLog[] {
    return [
      {
        id: 1,
        attendanceId: 103,
        employeeId: 3,
        employeeName: 'Shyam Sundar',
        modifiedBy: 'Admin (Raman)',
        modificationReason: 'Approved WFH adjustment due to client meeting',
        oldStatus: 'Present',
        newStatus: 'WFH',
        timestamp: '2026-08-11T10:30:00'
      },
      {
        id: 2,
        attendanceId: 104,
        employeeId: 4,
        employeeName: 'Vikash',
        modifiedBy: 'HR Manager',
        modificationReason: 'Adjusted half-day status as requested',
        oldStatus: 'Absent',
        newStatus: 'Half-Day',
        timestamp: '2026-08-10T14:15:00'
      }
    ];
  }
}
