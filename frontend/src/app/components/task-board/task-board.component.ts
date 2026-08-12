import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TaskService, TaskItem } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
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

  // Filter Models
  searchQuery = '';
  filterPriority = '';
  filterDepartment = '';

  // New Task Modal State
  showTaskModal = false;
  newTask: TaskItem = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    department: 'IT'
  };

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();
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

  getTasksByStatus(status: 'TODO' | 'IN_PROGRESS' | 'DONE'): TaskItem[] {
    return this.tasks.filter(t => {
      const matchesStatus = t.status === status;
      const matchesSearch = !this.searchQuery || 
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesPriority = !this.filterPriority || t.priority === this.filterPriority;
      const matchesDept = !this.filterDepartment || t.department === this.filterDepartment;

      return matchesStatus && matchesSearch && matchesPriority && matchesDept;
    });
  }

  moveTask(task: TaskItem, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'): void {
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
    const confirmed = await this.confirmDialogService.confirm({
      title: 'Delete Task',
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
    this.newTask = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      department: 'IT'
    };
    this.showTaskModal = true;
  }

  closeNewTaskModal(): void {
    this.showTaskModal = false;
  }

  submitNewTask(): void {
    if (!this.newTask.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    if (this.newTask.assigneeId) {
      const emp = this.employees.find(e => e.id === Number(this.newTask.assigneeId));
      if (emp) {
        this.newTask.assigneeName = emp.name;
        this.newTask.assigneeAvatar = emp.profileImageUrl;
        this.newTask.department = emp.department;
      }
    }

    this.taskService.createTask(this.newTask).subscribe({
      next: (res) => {
        this.closeNewTaskModal();
        this.loadTasks();
      },
      error: (err) => {
        const created: TaskItem = {
          ...this.newTask,
          id: this.tasks.length + 1,
          createdAt: new Date().toISOString()
        };
        this.tasks.push(created);
        this.closeNewTaskModal();
      }
    });
  }

  private getMockTasks(): TaskItem[] {
    return [
      {
        id: 1,
        title: 'Configure Spring Cloud Gateway Routing',
        description: 'Set up microservices ingress routes, dynamic Eureka discovery, rate limiting, and CORS headers.',
        assigneeId: 1,
        assigneeName: 'Raman',
        department: 'IT',
        priority: 'HIGH',
        status: 'DONE',
        createdAt: '2026-08-11T10:00:00'
      },
      {
        id: 2,
        title: 'Refactor Angular Component Core Modules',
        description: 'Migrate components into core, shared, and features modular enterprise folder structure.',
        assigneeId: 2,
        assigneeName: 'Ramesh',
        department: 'IT',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        createdAt: '2026-08-11T11:30:00'
      },
      {
        id: 3,
        title: 'Review Nvidia AI Performance Evaluation Prompt',
        description: 'Optimize system prompt and verify multi-model fallback responses with Speech APIs.',
        assigneeId: 3,
        assigneeName: 'Shyam Sundar',
        department: 'IT',
        priority: 'MEDIUM',
        status: 'TODO',
        createdAt: '2026-08-11T14:00:00'
      },
      {
        id: 4,
        title: 'Audit Payroll Tax Deduction Calculations',
        description: 'Verify itemized tax deduction formulas and automated text payslip generator.',
        assigneeId: 4,
        assigneeName: 'Vikash',
        department: 'Operations',
        priority: 'LOW',
        status: 'TODO',
        createdAt: '2026-08-12T09:15:00'
      }
    ];
  }
}
