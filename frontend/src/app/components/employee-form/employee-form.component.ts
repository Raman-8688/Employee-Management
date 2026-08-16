import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';
import { Employee } from '../../models/employee';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
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
    joinDate: new Date().toISOString().split('T')[0],
    profileImageUrl: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  validationErrorMessage: string | null = null;

  constructor(
    private employeeService: EmployeeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.validationErrorMessage = null;
    if (this.employee) {
      this.formData = {
        name: this.employee.name || '',
        email: this.employee.email || '',
        department: this.employee.department || '',
        sal: this.employee.sal || 0,
        employmentType: this.employee.employmentType || 'Employment',
        joinDate: this.employee.joinDate || new Date().toISOString().split('T')[0],
        profileImageUrl: this.employee.profileImageUrl || ''
      };
      if (this.employee.profileImageUrl) {
        this.imagePreview = this.employee.profileImageUrl;
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.validationErrorMessage = 'Selected profile image exceeds maximum allowed limit of 10MB.';
        return;
      }
      this.validationErrorMessage = null;
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  save() {
    this.isUploading = true;
    this.validationErrorMessage = null;

    if (this.selectedFile) {
      // Upload image first
      this.employeeService.uploadImage(this.selectedFile).subscribe({
        next: (res: any) => {
          let uploadedUrl = '';
          if (typeof res === 'string') {
            uploadedUrl = res;
          } else if (res) {
            uploadedUrl = res.imageUrl || res.url ||
                          (typeof res.data === 'string' ? res.data :
                          (res.data?.imageUrl || res.data?.url || ''));
          }
          if (uploadedUrl) {
            this.formData.profileImageUrl = uploadedUrl;
          }
          this.submitEmployeeData();
        },
        error: (err) => {
          console.error('Image upload failed:', err);
          this.isUploading = false;
          const msg = err.error?.message || 'Failed to upload profile image. File might exceed 10MB limit.';
          this.validationErrorMessage = msg;
        }
      });
    } else {
      this.submitEmployeeData();
    }
  }

  private submitEmployeeData() {
    const employeeToSave: Employee = {
      name: this.formData.name,
      email: this.formData.email,
      department: this.formData.department,
      sal: Number(this.formData.sal),
      employmentType: this.formData.employmentType,
      joinDate: this.formData.joinDate,
      profileImageUrl: this.formData.profileImageUrl
    };

    if (this.employee?.id) {
      this.employeeService.updateEmployee({ id: this.employee.id, ...employeeToSave })
        .subscribe({
          next: () => {
            this.isUploading = false;
            this.notificationService.getUnreadCount(1).subscribe({ error: () => {} });
            this.close.emit();
          },
          error: (err) => {
            this.isUploading = false;
            console.error('Update error:', err);
            this.validationErrorMessage = err.error?.message || err.error?.data || 'Failed to update employee details.';
          }
        });
    } else {
      this.employeeService.saveEmployee(employeeToSave)
        .subscribe({
          next: () => {
            this.isUploading = false;
            this.notificationService.getUnreadCount(1).subscribe({ error: () => {} });
            this.close.emit();
          },
          error: (err) => {
            this.isUploading = false;
            console.error('Save error:', err);
            this.validationErrorMessage = err.error?.message || err.error?.data || 'An employee with this email address already exists. Please use a unique email address.';
          }
        });
    }
  }


}