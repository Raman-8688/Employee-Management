import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';

interface DepartmentStat {
  name: string;
  count: number;
  totalSalary: number;
  percentage: number;
  colorClass: string;
}

interface RecentActivity {
  id: number;
  type: 'onboarding' | 'ai' | 'payroll' | 'document';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  badgeClass: string;
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
  employees: Employee[] = [];

  // Top KPI Metrics
  totalHeadcount = 0;
  onboardingCount = 2;
  offboardingCount = 1;
  totalMonthlyPayroll = 0;

  // Breakdown Data
  departmentStats: DepartmentStat[] = [];

  // Recent Activity Data
  recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'onboarding',
      icon: 'person_add',
      title: 'New Employee Added',
      description: 'Shyam Sundar was added to IT Department',
      timestamp: '10 mins ago',
      badgeClass: 'bg-primary-subtle text-primary'
    },
    {
      id: 2,
      type: 'ai',
      icon: 'auto_awesome',
      title: 'AI Appraisal Generated',
      description: 'Nvidia AI generated performance review for Raman',
      timestamp: '1 hour ago',
      badgeClass: 'bg-purple-subtle text-purple'
    },
    {
      id: 3,
      type: 'payroll',
      icon: 'payments',
      title: 'Payroll Processed',
      description: 'Monthly payroll batch #2026-08 approved',
      timestamp: '3 hours ago',
      badgeClass: 'bg-success-subtle text-success'
    },
    {
      id: 4,
      type: 'document',
      icon: 'description',
      title: 'Document Updated',
      description: 'Updated HR Compliance & Leave Policy document',
      timestamp: 'Yesterday',
      badgeClass: 'bg-info-subtle text-info'
    }
  ];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.employeeService.findAllEmployee().subscribe({
      next: (data: Employee[]) => {
        this.employees = data || [];
        this.computeKpiMetrics();
        this.computeDepartmentStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.isLoading = false;
      }
    });
  }

  private computeKpiMetrics(): void {
    this.totalHeadcount = this.employees.length;
    this.totalMonthlyPayroll = this.employees.reduce((acc, emp) => {
      const sal = typeof emp.sal === 'number' ? emp.sal : parseFloat(emp.sal as any) || 0;
      return acc + sal;
    }, 0);
  }

  private computeDepartmentStats(): void {
    const deptMap: { [key: string]: { count: number; totalSalary: number } } = {};

    this.employees.forEach((emp) => {
      const dept = emp.department || 'General';
      const sal = typeof emp.sal === 'number' ? emp.sal : parseFloat(emp.sal as any) || 0;
      
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, totalSalary: 0 };
      }
      deptMap[dept].count += 1;
      deptMap[dept].totalSalary += sal;
    });

    const colors = ['bg-primary', 'bg-info', 'bg-success', 'bg-purple', 'bg-warning'];
    let colorIdx = 0;

    const stats: DepartmentStat[] = Object.keys(deptMap).map((dept) => {
      const count = deptMap[dept].count;
      const totalSalary = deptMap[dept].totalSalary;
      const percentage = this.totalHeadcount > 0 ? Math.round((count / this.totalHeadcount) * 100) : 0;
      const colorClass = colors[colorIdx % colors.length];
      colorIdx++;

      return {
        name: dept,
        count,
        totalSalary,
        percentage,
        colorClass
      };
    });

    this.departmentStats = stats;
  }
}
