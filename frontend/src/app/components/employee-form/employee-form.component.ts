import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
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

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
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
          alert('Failed to upload image. Saving employee without new image.');
          this.submitEmployeeData();
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
            this.close.emit();
          },
          error: (err) => {
            this.isUploading = false;
            console.error('Update error:', err);
          }
        });
    } else {
      this.employeeService.saveEmployee(employeeToSave)
        .subscribe({
          next: () => {
            this.isUploading = false;
            this.close.emit();
          },
          error: (err) => {
            this.isUploading = false;
            console.error('Save error:', err);
          }
        });
    }
  }
}