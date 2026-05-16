import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { Employee } from '../../models/employee';
import { MatIconModule } from '@angular/material/icon';

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

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this.employeeService.findAllEmployee().subscribe({
      next: (data: Employee[]) => {
        console.log('Employees loaded:', data);
        this.employees = data;
        this.extractDepartments();
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.isLoading = false;
      },
    });
  }

  extractDepartments() {
    const depts = new Set(this.employees.map((emp) => emp.department));
    this.departments = Array.from(depts);
  }

  applyFiltersAndSort() {
    let result = [...this.employees];

    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query),
      );
    }

    // Apply department filter
    if (this.filterDepartment) {
      result = result.filter((emp) => emp.department === this.filterDepartment);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any = a[this.sortBy];
      let valueB: any = b[this.sortBy];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

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

  getTotalFilteredCount(): number {
    let result = [...this.employees];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query),
      );
    }

    if (this.filterDepartment) {
      result = result.filter((emp) => emp.department === this.filterDepartment);
    }

    return result.length;
  }

  openAddForm() {
    this.selectedEmployee = null;
    this.showForm = true;
  }

  editEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.showForm = true;
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
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

  onFormClose() {
    this.showForm = false;
    this.loadEmployees();
  }
}
