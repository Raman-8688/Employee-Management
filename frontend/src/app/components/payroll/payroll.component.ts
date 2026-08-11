import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

export interface PayrollRecord {
  id: number;
  employeeId: number;
  name: string;
  email: string;
  department: string;
  profileImageUrl?: string;
  baseSalary: number;
  deductions: number;
  netPay: number;
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  payPeriod: string;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css']
})
export class PayrollComponent implements OnInit {
  isLoading = true;
  payrollRecords: PayrollRecord[] = [];
  filteredRecords: PayrollRecord[] = [];

  // Summary Metrics
  totalPayrollOutflow = 0;
  processedCount = 0;
  processingCount = 0;
  pendingCount = 0;
  averageSalary = 0;

  // Search & Filters
  searchQuery = '';
  filterDepartment = '';
  filterStatus = '';
  departments: string[] = [];

  // Current Pay Period
  currentPayPeriod = 'August 2026';

  constructor(
    private employeeService: EmployeeService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadPayrollData();
  }

  loadPayrollData(): void {
    this.isLoading = true;
    this.employeeService.findAllEmployee().subscribe({
      next: (employees: Employee[]) => {
        this.payrollRecords = this.mapEmployeesToPayrollRecords(employees);
        this.extractDepartments();
        this.computeSummaryMetrics();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching payroll data:', err);
        // Fallback mock data if API is offline
        this.payrollRecords = this.getMockPayrollRecords();
        this.extractDepartments();
        this.computeSummaryMetrics();
        this.applyFilters();
        this.isLoading = false;
      }
    });
  }

  private mapEmployeesToPayrollRecords(employees: Employee[]): PayrollRecord[] {
    if (!employees || employees.length === 0) {
      return this.getMockPayrollRecords();
    }

    const statuses: ('Paid' | 'Processing' | 'Pending')[] = ['Paid', 'Paid', 'Processing', 'Paid', 'Pending'];

    return employees.map((emp, idx) => {
      const baseSalary = typeof emp.sal === 'number' ? emp.sal : parseFloat(emp.sal as any) || 15000;
      const deductions = Math.round(baseSalary * 0.10); // Standard 10% tax/deduction
      const netPay = baseSalary - deductions;
      const paymentStatus = statuses[idx % statuses.length];

      return {
        id: idx + 1,
        employeeId: emp.id || idx + 1,
        name: emp.name || 'Employee',
        email: emp.email || 'employee@company.com',
        department: emp.department || 'General',
        profileImageUrl: emp.profileImageUrl,
        baseSalary,
        deductions,
        netPay,
        paymentStatus,
        paymentDate: paymentStatus === 'Paid' ? '2026-08-01' : undefined,
        payPeriod: this.currentPayPeriod
      };
    });
  }

  private computeSummaryMetrics(): void {
    this.totalPayrollOutflow = this.payrollRecords.reduce((acc, curr) => acc + curr.netPay, 0);
    this.processedCount = this.payrollRecords.filter(r => r.paymentStatus === 'Paid').length;
    this.processingCount = this.payrollRecords.filter(r => r.paymentStatus === 'Processing').length;
    this.pendingCount = this.payrollRecords.filter(r => r.paymentStatus === 'Pending').length;
    this.averageSalary = this.payrollRecords.length > 0 
      ? Math.round(this.totalPayrollOutflow / this.payrollRecords.length) 
      : 0;
  }

  private extractDepartments(): void {
    const depts = new Set(this.payrollRecords.map(r => r.department));
    this.departments = Array.from(depts);
  }

  applyFilters(): void {
    this.filteredRecords = this.payrollRecords.filter(record => {
      const matchesSearch = !this.searchQuery || 
        record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesDept = !this.filterDepartment || record.department === this.filterDepartment;
      const matchesStatus = !this.filterStatus || record.paymentStatus === this.filterStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterDepartment = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  async runPayroll(record: PayrollRecord): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: `Run Payroll for ${record.name}`,
      message: `Process net salary payment of $${record.netPay.toLocaleString()} for ${record.name} (${record.department})?`,
      confirmText: 'Process Payment',
      cancelText: 'Cancel',
      type: 'info'
    });

    if (confirmed) {
      record.paymentStatus = 'Paid';
      record.paymentDate = new Date().toISOString().split('T')[0];
      this.computeSummaryMetrics();
      this.applyFilters();
    }
  }

  async runBatchPayroll(): Promise<void> {
    const pendingCount = this.payrollRecords.filter(r => r.paymentStatus !== 'Paid').length;
    if (pendingCount === 0) {
      alert('All payroll records for this period are already processed!');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Run Batch Payroll',
      message: `Process payments for all ${pendingCount} pending/processing employees for period ${this.currentPayPeriod}?`,
      confirmText: 'Run Batch Payroll',
      cancelText: 'Cancel',
      type: 'info'
    });

    if (confirmed) {
      this.payrollRecords.forEach(r => {
        r.paymentStatus = 'Paid';
        r.paymentDate = new Date().toISOString().split('T')[0];
      });
      this.computeSummaryMetrics();
      this.applyFilters();
    }
  }

  downloadPayslip(record: PayrollRecord): void {
    const payslipContent = `
=====================================================
          ENTERPRISE PAYROLL PAYSLIP
=====================================================
Pay Period:       ${record.payPeriod}
Payment Date:     ${record.paymentDate || 'Processing'}
Status:           ${record.paymentStatus.toUpperCase()}

EMPLOYEE DETAILS:
-----------------------------------------------------
Name:             ${record.name}
Employee ID:      EMP-#${record.employeeId}
Department:       ${record.department}
Email:            ${record.email}

SALARY BREAKDOWN:
-----------------------------------------------------
Base Salary:      $${record.baseSalary.toLocaleString()}
Deductions (10%): -$${record.deductions.toLocaleString()}
-----------------------------------------------------
NET PAYABLE:      $${record.netPay.toLocaleString()}
=====================================================
Generated by Enterprise Employee Management System
    `;

    const blob = new Blob([payslipContent.trim()], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${record.name.replace(/\s+/g, '_')}_${this.currentPayPeriod.replace(/\s+/g, '')}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private getMockPayrollRecords(): PayrollRecord[] {
    return [
      { id: 1, employeeId: 1, name: 'Raman', email: 'ramanms8688@gmail.com', department: 'IT', baseSalary: 15000, deductions: 1500, netPay: 13500, paymentStatus: 'Paid', paymentDate: '2026-08-01', payPeriod: 'August 2026' },
      { id: 2, employeeId: 2, name: 'Ramesh', email: 'ramesh@gmail.com', department: 'IT', baseSalary: 20000, deductions: 2000, netPay: 18000, paymentStatus: 'Paid', paymentDate: '2026-08-01', payPeriod: 'August 2026' },
      { id: 3, employeeId: 3, name: 'Shyam Sundar', email: 'shyam@gmail.com', department: 'IT', baseSalary: 23000, deductions: 2300, netPay: 20700, paymentStatus: 'Processing', payPeriod: 'August 2026' },
      { id: 4, employeeId: 4, name: 'Vikash', email: 'viky@gmail.com', department: 'Operations', baseSalary: 25000, deductions: 2500, netPay: 22500, paymentStatus: 'Paid', paymentDate: '2026-08-01', payPeriod: 'August 2026' }
    ];
  }
}
