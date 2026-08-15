import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TaskService, TaskItem } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../models/employee';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardComponent implements OnInit {
  isLoading = true;
  tasks: TaskItem[] = [];
  employees: Employee[] = [];
  draggedTask: TaskItem | null = null;

  // Filter Models
  searchQuery = '';
  filterPriority = '';
  filterType = '';
  filterDepartment = '';

  // New & Edit Task Modal State
  showTaskModal = false;
  isEditMode = false;
  modalTitle = 'Create New Jira Issue';

  taskForm: TaskItem = {
    title: '',
    description: '',
    taskType: 'TASK',
    priority: 'MEDIUM',
    status: 'TODO',
    department: 'IT'
  };

  // Role Based Access
  userRole = '';

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userRole = user?.role || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_EMPLOYEE');

    this.loadTasks();
    this.loadEmployees();
  }

  get isAdminOrManager(): boolean {
    return this.userRole === 'ROLE_ADMIN' || this.userRole === 'ROLE_MANAGER' || this.userRole === 'ROLE_HR';
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.tasks = res.data;
        } else {
          this.tasks = this.getMockTasks();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
        this.tasks = this.getMockTasks();
        this.isLoading = false;
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.findAllEmployee().subscribe({
      next: (data) => {
        this.employees = data || [];
      },
      error: () => {}
    });
  }

  get totalTasksCount(): number {
    return this.tasks.length;
  }

  get openBugsCount(): number {
    return this.tasks.filter(t => t.taskType === 'BUG' && t.status !== 'DONE').length;
  }

  get doneTasksCount(): number {
    return this.tasks.filter(t => t.status === 'DONE').length;
  }

  get highPriorityCount(): number {
    return this.tasks.filter(t => (t.priority === 'HIGH' || t.priority === 'CRITICAL') && t.status !== 'DONE').length;
  }

  getTasksByStatus(status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'): TaskItem[] {
    return this.tasks.filter(t => {
      const matchesStatus = t.status === status;
      const matchesSearch = !this.searchQuery || 
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesPriority = !this.filterPriority || t.priority === this.filterPriority;
      const matchesType = !this.filterType || t.taskType === this.filterType;
      const matchesDept = !this.filterDepartment || t.department === this.filterDepartment;

      return matchesStatus && matchesSearch && matchesPriority && matchesType && matchesDept;
    });
  }

  // HTML Drag & Drop Implementation
  onDragStart(event: DragEvent, task: TaskItem): void {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(task.id));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetStatus: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'): void {
    event.preventDefault();
    if (this.draggedTask && this.draggedTask.status !== targetStatus) {
      this.moveTask(this.draggedTask, targetStatus);
    }
    this.draggedTask = null;
  }

  moveTask(task: TaskItem, newStatus: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'): void {
    const oldStatus = task.status;
    task.status = newStatus;

    if (task.id) {
      this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
        error: (err) => {
          console.error('Failed to update task status:', err);
          task.status = oldStatus;
        }
      });
    }
  }

  async deleteTask(task: TaskItem): Promise<void> {
    if (!this.isAdminOrManager) {
      alert('Access Denied: Only Admins and Managers can delete tasks.');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm({
      title: 'Delete Jira Issue',
      message: `Are you sure you want to delete task "${task.title}"?`,
      confirmText: 'Delete Task',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (confirmed && task.id) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        error: (err) => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        }
      });
    }
  }

  openNewTaskModal(): void {
    this.isEditMode = false;
    this.modalTitle = 'Create New Jira Issue';
    this.taskForm = {
      title: '',
      description: '',
      taskType: 'STORY',
      priority: 'MEDIUM',
      status: 'TODO',
      department: 'IT'
    };
    this.showTaskModal = true;
  }

  openEditTaskModal(task: TaskItem): void {
    if (!this.isAdminOrManager) {
      alert('Access Denied: Only Admins and Managers can edit tasks.');
      return;
    }

    this.isEditMode = true;
    this.modalTitle = `Edit Task #${task.id}`;
    this.taskForm = { ...task };
    this.showTaskModal = true;
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
  }

  submitTaskForm(): void {
    if (!this.taskForm.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    if (this.taskForm.assigneeId) {
      const emp = this.employees.find(e => e.id === Number(this.taskForm.assigneeId));
      if (emp) {
        this.taskForm.assigneeName = emp.name;
        this.taskForm.assigneeAvatar = emp.profileImageUrl;
        this.taskForm.department = emp.department;
      }
    }

    if (this.isEditMode && this.taskForm.id) {
      this.taskService.updateTask(this.taskForm.id, this.taskForm).subscribe({
        next: () => {
          this.closeTaskModal();
          this.loadTasks();
        },
        error: () => {
          const idx = this.tasks.findIndex(t => t.id === this.taskForm.id);
          if (idx !== -1) {
            this.tasks[idx] = { ...this.taskForm };
          }
          this.closeTaskModal();
        }
      });
    } else {
      this.taskService.createTask(this.taskForm).subscribe({
        next: () => {
          this.closeTaskModal();
          this.loadTasks();
        },
        error: () => {
          const created: TaskItem = {
            ...this.taskForm,
            id: this.tasks.length + 1,
            createdAt: new Date().toISOString()
          };
          this.tasks.push(created);
          this.closeTaskModal();
        }
      });
    }
  }

  private getMockTasks(): TaskItem[] {
    return [
      {
        id: 1,
        title: 'Configure Spring Cloud Gateway Ingress & Microservices Routing',
        description: 'Set up microservices ingress routes, dynamic Eureka discovery, rate limiting, and CORS headers.',
        taskType: 'STORY',
        priority: 'HIGH',
        status: 'DONE',
        assigneeId: 1,
        assigneeName: 'Raman',
        department: 'IT',
        createdAt: '2026-08-11T10:00:00'
      },
      {
        id: 2,
        title: 'Refactor Angular Microservices Core Architecture',
        description: 'Migrate components into core, shared, and feature modular enterprise folder structure.',
        taskType: 'TASK',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assigneeId: 2,
        assigneeName: 'Ramesh',
        department: 'IT',
        createdAt: '2026-08-11T11:30:00'
      },
      {
        id: 3,
        title: 'Integrate Nvidia Llama 3.1 8B AI Engine',
        description: 'Optimize system prompt and verify multi-model fallback responses with Speech APIs.',
        taskType: 'STORY',
        priority: 'CRITICAL',
        status: 'IN_REVIEW',
        assigneeId: 3,
        assigneeName: 'Shyam Sundar',
        department: 'IT',
        createdAt: '2026-08-11T14:00:00'
      },
      {
        id: 4,
        title: 'Fix CORS Preflight Headers on Auth Controller',
        description: 'Remove duplicate Access-Control-Allow-Origin annotations and centralize header deduplication.',
        taskType: 'BUG',
        priority: 'CRITICAL',
        status: 'DONE',
        assigneeId: 1,
        assigneeName: 'Raman',
        department: 'IT',
        createdAt: '2026-08-12T09:15:00'
      },
      {
        id: 5,
        title: 'Audit Payroll Tax Deduction Calculations',
        description: 'Verify itemized tax deduction formulas and automated text payslip generator.',
        taskType: 'TASK',
        priority: 'LOW',
        status: 'TODO',
        assigneeId: 4,
        assigneeName: 'Vikash',
        department: 'Operations',
        createdAt: '2026-08-12T09:15:00'
      }
    ];
  }
}
