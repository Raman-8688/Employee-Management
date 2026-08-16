import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { Employee } from '../../models/employee';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeFormComponent, MatIconModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  displayedEmployees: Employee[] = [];
  showForm = false;
  selectedEmployee: Employee | null = null;
  isLoading = false;

  // Tabs
  activeTab: string = 'active';

  // Search and Filters
  searchQuery = '';
  filterDepartment = '';
  departments: string[] = [];

  // Sorting
  sortBy: keyof Employee = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50];

  constructor(
    private employeeService: EmployeeService,
    private confirmDialogService: ConfirmDialogService,
    private aiService: AiService
  ) {}

  setTab(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  get activeCount(): number {
    return this.employees.filter(e => !e.status || 'ACTIVE'.equalsIgnoreCase(e.status)).length;
  }

  get onboardingCount(): number {
    return this.employees.filter(e => 'ONBOARDING'.equalsIgnoreCase(e.status)).length;
  }

  get offboardingCount(): number {
    return this.employees.filter(e => 'OFFBOARDING'.equalsIgnoreCase(e.status) || 'TERMINATED'.equalsIgnoreCase(e.status)).length;
  }

  ngOnInit() {
    this.loadEmployees();
  }


  loadEmployees() {
    this.isLoading = true;
    this.employeeService.findAllEmployee().subscribe({
      next: (data: Employee[]) => {
        console.log('Employees loaded:', data);
        console.log('Is array:', Array.isArray(data));
        console.log('Length:', data?.length);

        // Ensure data is an array
        this.employees = Array.isArray(data) ? data : [];
        this.extractDepartments();
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.isLoading = false;
        this.employees = [];
        // Show user-friendly message
        if (error.status === 403) {
          alert("Access denied. You don't have permission to view employees.");
        } else {
          alert('Failed to load employees. Please try again.');
        }
      },
    });
  }

  extractDepartments() {
    // Ensure employees is an array before calling map
    if (Array.isArray(this.employees) && this.employees.length > 0) {
      const depts = new Set(this.employees.map((emp) => emp.department));
      this.departments = Array.from(depts);
    } else {
      this.departments = [];
    }
  }

  applyFiltersAndSort() {
    // Ensure employees is an array
    let result = Array.isArray(this.employees) ? [...this.employees] : [];

    // 1. Apply Tab Filter (Active, Onboarding, Offboarding)
    if (this.activeTab === 'active') {
      result = result.filter(emp => !emp.status || 'ACTIVE'.equalsIgnoreCase(emp.status));
    } else if (this.activeTab === 'onboarding') {
      result = result.filter(emp => 'ONBOARDING'.equalsIgnoreCase(emp.status));
    } else if (this.activeTab === 'offboarding') {
      result = result.filter(emp => 'OFFBOARDING'.equalsIgnoreCase(emp.status) || 'TERMINATED'.equalsIgnoreCase(emp.status));
    }

    // Apply search query
    if (this.searchQuery && result.length > 0) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          (emp.name && emp.name.toLowerCase().includes(query)) ||
          (emp.email && emp.email.toLowerCase().includes(query)) ||
          (emp.department && emp.department.toLowerCase().includes(query)) ||
          (emp.techStackSummary && emp.techStackSummary.toLowerCase().includes(query)),
      );
    }

    // Apply department filter
    if (this.filterDepartment && result.length > 0) {
      result = result.filter((emp) => emp.department === this.filterDepartment);
    }

    // Apply sorting
    if (result.length > 0 && this.sortBy) {
      result.sort((a, b) => {
        let valueA: any = a[this.sortBy];
        let valueB: any = b[this.sortBy];

        if (valueA === undefined) valueA = '';
        if (valueB === undefined) valueB = '';

        if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }


    // Update pagination
    this.totalPages = Math.ceil(result.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    // Get current page items
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedEmployees = result.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  getTotalFilteredCount(): number {
    let result = Array.isArray(this.employees) ? [...this.employees] : [];

    if (this.searchQuery && result.length > 0) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          (emp.name && emp.name.toLowerCase().includes(query)) ||
          (emp.email && emp.email.toLowerCase().includes(query)) ||
          (emp.department && emp.department.toLowerCase().includes(query)),
      );
    }

    if (this.filterDepartment && result.length > 0) {
      result = result.filter((emp) => emp.department === this.filterDepartment);
    }

    return result.length;
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onDepartmentFilterChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  sort(column: keyof Employee) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(column: keyof Employee): string {
    if (this.sortBy !== column) return 'unfold_more';
    return this.sortOrder === 'asc'
      ? 'keyboard_arrow_up'
      : 'keyboard_arrow_down';
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterDepartment = '';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.applyFiltersAndSort();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFiltersAndSort();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFiltersAndSort();
    }
  }

  openAddForm() {
    this.selectedEmployee = null;
    this.showForm = true;
  }

  editEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.showForm = true;
  }

  async deleteEmployee(id: number) {
    const employeeToDelete = this.employees.find((e) => e.id === id);
    const employeeName = employeeToDelete ? employeeToDelete.name : 'this employee';

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      confirmText: 'Delete Employee',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          alert('Error deleting employee');
        },
      });
    }
  }

  generateAiReview(emp: Employee) {
    if (!emp.id) return;
    this.confirmDialogService.confirm({
      title: `✨ AI Appraisal: ${emp.name}`,
      message: `Generate an automated Nvidia AI performance evaluation report for ${emp.name} (${emp.department})?`,
      confirmText: 'Generate Review',
      cancelText: 'Cancel',
      type: 'info'
    }).then((confirmed) => {
      if (confirmed) {
        this.aiService.generatePerformanceReview(emp.id!).subscribe({
          next: (res) => {
            this.confirmDialogService.confirm({
              title: `✨ AI Performance Report (${emp.name})`,
              message: res.data.reply,
              confirmText: 'Done',
              cancelText: 'Close',
              type: 'info'
            });
          },
          error: (err) => {
            console.error('AI Review Error:', err);
            alert('Failed to generate AI performance review.');
          }
        });
      }
    });
  }

  onFormClose() {
    this.showForm = false;
    this.loadEmployees();
  }

  // WhatsApp Style Photo Modal Properties & Methods
  photoPreviewEmployee: Employee | null = null;
  showPhotoModal = false;
  isUploadingPhoto = false;

  openPhotoPreview(emp: Employee, event: MouseEvent) {
    event.stopPropagation();
    this.photoPreviewEmployee = emp;
    this.showPhotoModal = true;
  }

  closePhotoPreview() {
    this.showPhotoModal = false;
    this.photoPreviewEmployee = null;
  }

  onPhotoSelectedInModal(event: any) {
    const file = event.target.files[0];
    if (file && this.photoPreviewEmployee) {
      this.isUploadingPhoto = true;
      this.employeeService.uploadImage(file).subscribe({
        next: (response: any) => {
          let imageUrl = '';
          if (typeof response === 'string') {
            imageUrl = response;
          } else if (response) {
            imageUrl = response.imageUrl || response.url ||
                       (typeof response.data === 'string' ? response.data :
                       (response.data?.imageUrl || response.data?.url || ''));
          }

          if (imageUrl && this.photoPreviewEmployee) {
            this.photoPreviewEmployee.profileImageUrl = imageUrl;
            // Persist update in DB
            this.employeeService.updateEmployee(this.photoPreviewEmployee).subscribe({
              next: () => {
                this.isUploadingPhoto = false;
                this.loadEmployees();
              },
              error: (err) => {
                console.error('Error saving updated employee photo:', err);
                this.isUploadingPhoto = false;
              }
            });
          } else {
            this.isUploadingPhoto = false;
          }
        },
        error: (err) => {
          console.error('Error uploading photo:', err);
          this.isUploadingPhoto = false;
          alert('Failed to upload image. Please try again.');
        }
      });
    }
  }
}
