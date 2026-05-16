import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  employeeData: any[] = [];
  searchObj = {
    name: '',
    email: '',
    department: ''
  };

  showPopup: boolean = false;
  popupMode: 'add' | 'edit' = 'add';
  isLoading: boolean = false;
  deleteConfirmId: number | null = null;

  selectedEmployee: any = {
    name: '',
    email: '',
    department: '',
    sal: '',
  };

  page: number = 0;
  size: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;
  sortBy: string = 'id';
  sortDir: string = 'desc';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployee();
  }

  loadEmployee() {
    this.isLoading = true;
    const params = {
      name: this.searchObj.name,
      email: this.searchObj.email,
      department: this.searchObj.department,
      page: this.page,
      size: this.size,
      sortBy: this.sortBy,
      sortDir: this.sortDir
    };

    this.employeeService.searchEmployees(params).subscribe({
      next: (response) => {
        this.employeeData = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  searchEmployee() {
    this.page = 0;
    this.loadEmployee();
  }

  resetSearch() {
    this.searchObj = {
      name: '',
      email: '',
      department: ''
    };
    this.page = 0;
    this.loadEmployee();
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadEmployee();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadEmployee();
    }
  }

  changePageSize() {
    this.page = 0;
    this.loadEmployee();
  }

  deleteEmployee(id: number) {
    this.deleteConfirmId = id;
  }

  confirmDelete() {
    if (this.deleteConfirmId) {
      this.employeeService.deleteEmployee(this.deleteConfirmId).subscribe(() => {
        this.loadEmployee();
        this.deleteConfirmId = null;
      });
    }
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  editEmployee(emp: any) {
    this.selectedEmployee = { ...emp };
    this.popupMode = 'edit';
    this.showPopup = true;
  }

  openAddPopup() {
    this.selectedEmployee = {
      name: '',
      email: '',
      department: '',
      sal: '',
    };
    this.popupMode = 'add';
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedEmployee = {
      name: '',
      email: '',
      department: '',
      sal: '',
    };
  }

  saveOrUpdateEmployee() {
    this.isLoading = true;
    if (this.selectedEmployee.id) {
      this.employeeService.updateEmployee(this.selectedEmployee).subscribe(() => {
        this.loadEmployee();
        this.closePopup();
        this.isLoading = false;
      });
    } else {
      this.employeeService.saveEmployee(this.selectedEmployee).subscribe(() => {
        this.loadEmployee();
        this.closePopup();
        this.isLoading = false;
      });
    }
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.loadEmployee();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return '↕️';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }
}