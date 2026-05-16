import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';


@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  @Input() employee: Employee | null = null;
  @Output() close = new EventEmitter<void>();

  formData: Employee = {
    name: '',
    email: '',
    department: '',
    sal: 0,
    employmentType: 'Employment',
    joinDate: new Date().toISOString().split('T')[0]
  };

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    if (this.employee) {
      this.formData = {
        name: this.employee.name || '',
        email: this.employee.email || '',
        department: this.employee.department || '',
        sal: this.employee.sal || 0,
        employmentType: this.employee.employmentType || 'Employment',
        joinDate: this.employee.joinDate || new Date().toISOString().split('T')[0]
      };
    }
  }

  save() {
    const employeeToSave = {
      name: this.formData.name,
      email: this.formData.email,
      department: this.formData.department,
      sal: Number(this.formData.sal),
      employmentType: this.formData.employmentType,
      joinDate: this.formData.joinDate
    };

    if (this.employee?.id) {
      this.employeeService.updateEmployee({ id: this.employee.id, ...employeeToSave })
        .subscribe({
          next: () => {
            this.close.emit();
          },
          error: (err) => console.error('Update error:', err)
        });
    } else {
      this.employeeService.saveEmployee(employeeToSave)
        .subscribe({
          next: () => {
            this.close.emit();
          },
          error: (err) => console.error('Save error:', err)
        });
    }
  }
}