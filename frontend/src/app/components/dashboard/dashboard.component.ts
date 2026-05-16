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

  // selectedEmployee: any = {};

  showPopup: boolean = false;

  selectedEmployee: any = {
    name: '',
    email: '',
    department: '',
    sal: '',
  };

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployee();
  }

  loadEmployee() {
    this.employeeService.findAllEmployee().subscribe({
      next: (response) => {
        console.log(response);
        this.employeeData = response.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  deleteEmployee(id: number) {
    this.employeeService.deleteEmployee(id).subscribe(() => {
      alert('Deleted Successfully');
      this.loadEmployee();
    });
  }

  editEmployee(emp: any) {
    this.selectedEmployee = { ...emp };
    this.showPopup = true;
  }

  updateEmployee() {
    this.employeeService.updateEmployee(this.selectedEmployee).subscribe({
      next: () => {
        alert('Updated Successfully');
        this.loadEmployee();
      },
    });
  }

  openAddPopup() {
    this.selectedEmployee = {
      name: '',
      email: '',
      department: '',
      sal: '',
    };

    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  saveOrUpdateEmployee() {
    if (this.selectedEmployee.id) {
      // UPDATE
      this.employeeService
        .updateEmployee(this.selectedEmployee)
        .subscribe(() => {
          this.loadEmployee();
          this.closePopup();
        });
    } else {
      // SAVE
      this.employeeService.saveEmployee(this.selectedEmployee).subscribe(() => {
        this.loadEmployee();
        this.closePopup();
      });
    }
  }
}
