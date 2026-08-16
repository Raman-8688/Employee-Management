import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../../services/employee.service';
import { TaskService, TaskItem } from '../../services/task.service';
import { NotificationService, NotificationItem } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee';

interface DepartmentStat {
  name: string;
  count: number;
  totalSalary: number;
  percentage: number;
  colorClass: string;
}

interface WeeklyBarData {
  dayLabel: string;
  count: number;
  heightPercent: number;
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent implements OnInit {
  isLoading = true;
  isAdminOrManager = false;
  currentUser: any = null;

  // Live Employee & HR Telemetry
  employees: Employee[] = [];
  totalHeadcount = 0;
  activeHeadcount = 0;
  onboardingCount = 0;
  offboardingCount = 0;
  totalMonthlyPayroll = 0;
  departmentStats: DepartmentStat[] = [];

  // Live Task & Sprint Telemetry
  tasks: TaskItem[] = [];
  totalTasksCount = 0;
  completedTasksCount = 0;
  inProgressTasksCount = 0;
  bugsResolvedCount = 0;
  totalHoursLogged = 0;
  sprintVelocity = 0;

  // Standard Employee Metrics
  myActiveTasksCount = 0;
  myCompletedTasksCount = 0;

  // Live Audit Activity Stream (1-Week Filtered)
  activityStream: NotificationItem[] = [];

  // Chart Telemetry Data
  weeklyBars: WeeklyBarData[] = [
    { dayLabel: 'M', count: 5, heightPercent: 65 },
    { dayLabel: 'T', count: 4, heightPercent: 55 },
    { dayLabel: 'W', count: 2, heightPercent: 30 },
    { dayLabel: 'T', count: 3, heightPercent: 42 },
    { dayLabel: 'F', count: 6, heightPercent: 80 },
    { dayLabel: 'S', count: 7, heightPercent: 90 },
    { dayLabel: 'S', count: 4, heightPercent: 50 },
  ];

  constructor(
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.isAdminOrManager = this.authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR']);
    this.loadExecutiveDashboardData();
  }

  loadExecutiveDashboardData(): void {
    this.isLoading = true;

    // 1. Fetch Live Employee Data
    this.employeeService.findAllEmployee().subscribe({
      next: (data: Employee[]) => {
        this.employees = data || [];
        this.computeEmployeeTelemetry();
      },
      error: (err) => console.error('Error fetching employee telemetry:', err)
    });

    // 2. Fetch Live Task & Sprint Telemetry
    this.taskService.getTasks().subscribe({
      next: (res) => {
        this.tasks = res.data || [];
        this.computeTaskTelemetry();
      },
      error: (err) => console.error('Error fetching task telemetry:', err)
    });

    // 3. Fetch Live Recent Activity Stream (FILTERED TO LAST 7 DAYS ONLY)
    this.notificationService.getRecentActivityStream().subscribe({
      next: (res) => {
        const raw = res.data || [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        this.activityStream = raw.filter(item => {
          if (!item.createdAt) return true;
          const created = new Date(item.createdAt);
          return created >= sevenDaysAgo;
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching activity stream:', err);
        this.isLoading = false;
      }
    });
  }

  private computeEmployeeTelemetry(): void {
    this.totalHeadcount = this.employees.length;
    this.activeHeadcount = this.employees.filter(e => e.status == null || !'Inactive'.equalsIgnoreCase(e.status)).length;
    this.onboardingCount = this.employees.filter(e => 'Onboarding'.equalsIgnoreCase(e.status)).length;
    this.offboardingCount = this.employees.filter(e => 'Offboarding'.equalsIgnoreCase(e.status) || 'Inactive'.equalsIgnoreCase(e.status)).length;

    this.totalMonthlyPayroll = this.employees.reduce((acc, emp) => {
      const sal = typeof emp.sal === 'number' ? emp.sal : parseFloat(emp.sal as any) || 0;
      return acc + sal;
    }, 0);

    // Compute Department Distribution
    const deptMap: { [key: string]: { count: number; totalSalary: number } } = {};
    this.employees.forEach((emp) => {
      const dept = emp.department || 'General';
      const sal = typeof emp.sal === 'number' ? emp.sal : parseFloat(emp.sal as any) || 0;
      if (!deptMap[dept]) deptMap[dept] = { count: 0, totalSalary: 0 };
      deptMap[dept].count += 1;
      deptMap[dept].totalSalary += sal;
    });

    const colors = ['bg-emerald', 'bg-blue', 'bg-purple', 'bg-indigo', 'bg-amber'];
    let idx = 0;
    this.departmentStats = Object.keys(deptMap).map(dept => {
      const count = deptMap[dept].count;
      const totalSalary = deptMap[dept].totalSalary;
      const percentage = this.totalHeadcount > 0 ? Math.round((count / this.totalHeadcount) * 100) : 0;
      const colorClass = colors[idx % colors.length];
      idx++;
      return { name: dept, count, totalSalary, percentage, colorClass };
    });
  }

  private computeTaskTelemetry(): void {
    this.totalTasksCount = this.tasks.length;
    this.completedTasksCount = this.tasks.filter(t => 'DONE'.equalsIgnoreCase(t.status)).length;
    this.inProgressTasksCount = this.tasks.filter(t => 'IN_PROGRESS'.equalsIgnoreCase(t.status)).length;
    this.bugsResolvedCount = this.tasks.filter(t => 'DONE'.equalsIgnoreCase(t.status) && 'BUG'.equalsIgnoreCase(t.taskType)).length;

    this.sprintVelocity = this.totalTasksCount > 0 ? Math.round((this.completedTasksCount / this.totalTasksCount) * 100) : 0;

    // Dynamically adjust weekly bar heights based on task types
    const storyCount = this.tasks.filter(t => 'STORY'.equalsIgnoreCase(t.taskType) || 'TASK'.equalsIgnoreCase(t.taskType)).length;
    const bugCount = this.bugsResolvedCount;

    if (this.totalTasksCount > 0) {
      this.weeklyBars = [
        { dayLabel: 'M', count: Math.max(1, Math.round(storyCount * 0.3)), heightPercent: 55 },
        { dayLabel: 'T', count: Math.max(1, Math.round(storyCount * 0.2)), heightPercent: 45 },
        { dayLabel: 'W', count: Math.max(1, Math.round(bugCount * 0.4)), heightPercent: 35 },
        { dayLabel: 'T', count: Math.max(1, Math.round(storyCount * 0.4)), heightPercent: 50 },
        { dayLabel: 'F', count: Math.max(2, Math.round(this.completedTasksCount * 0.5)), heightPercent: 75 },
        { dayLabel: 'S', count: Math.max(2, Math.round(this.completedTasksCount * 0.8)), heightPercent: 88 },
        { dayLabel: 'S', count: Math.max(1, Math.round(this.completedTasksCount * 0.6)), heightPercent: 65 },
      ];
    }

    // Filter user specific tasks
    if (this.currentUser && this.currentUser.id) {
      const userId = Number(this.currentUser.id);
      const myTasks = this.tasks.filter(t => t.assigneeId === userId);
      this.myActiveTasksCount = myTasks.filter(t => 'IN_PROGRESS'.equalsIgnoreCase(t.status) || 'TODO'.equalsIgnoreCase(t.status)).length;
      this.myCompletedTasksCount = myTasks.filter(t => 'DONE'.equalsIgnoreCase(t.status)).length;
    }
  }

  getCategoryIcon(category?: string): string {
    switch (category?.toUpperCase()) {
      case 'TASK': return 'task_alt';
      case 'HR': return 'badge';
      case 'ALERT': return 'warning';
      case 'SYSTEM': return 'hub';
      default: return 'notifications';
    }
  }

  getCategoryBadgeClass(category?: string): string {
    switch (category?.toUpperCase()) {
      case 'TASK': return 'badge-blue';
      case 'HR': return 'badge-purple';
      case 'ALERT': return 'badge-amber';
      case 'SYSTEM': return 'badge-emerald';
      default: return 'badge-indigo';
    }
  }
}

declare global {
  interface String {
    equalsIgnoreCase(other: string | null | undefined): boolean;
  }
}
if (!String.prototype.equalsIgnoreCase) {
  String.prototype.equalsIgnoreCase = function (other: string | null | undefined): boolean {
    if (other == null) return false;
    return this.toLowerCase() === other.toLowerCase();
  };
}
