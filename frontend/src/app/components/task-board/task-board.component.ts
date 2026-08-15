import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TaskService, TaskItem, SubTask, TaskComment, TaskTimeLog, SprintMetrics, EmployeeTaskAnalytics } from '../../services/task.service';
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

  // View Mode: Kanban vs Detailed List Table
  viewMode: 'KANBAN' | 'LIST' = 'KANBAN';

  // Filter Models
  searchQuery = '';
  filterPriority = '';
  filterType = '';
  filterDepartment = '';
  filterAssigneeId: number | null = null;

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
    department: 'IT',
    estimatedHours: 8.0,
    loggedHours: 0.0,
    tags: ''
  };

  // Detailed Task & Collaboration Modal State
  showDetailModal = false;
  selectedTaskForDetail: TaskItem | null = null;
  activeDetailTab: 'SUBTASKS' | 'COMMENTS' | 'TIMELOGS' = 'SUBTASKS';
  newSubtaskTitle = '';
  newCommentContent = '';
  logHoursAmount = 1.0;
  logHoursDescription = '';

  // Sprint Metrics & Employee Analytics Dashboard State
  sprintMetrics: SprintMetrics | null = null;
  showEmployeeAnalyticsModal = false;
  selectedAnalyticsEmployeeId: number | null = null;
  employeeAnalyticsData: EmployeeTaskAnalytics | null = null;

  // Role Based Access
  userRole = '';
  currentUserId = 1;
  currentUserName = 'Current User';

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userRole = user?.role || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_EMPLOYEE');
    if (user) {
      this.currentUserId = user.id || 1;
      this.currentUserName = (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username) || 'User';
    }

    this.loadTasks();
    this.loadEmployees();
    this.loadSprintAnalytics();
  }

  get isAdminOrManager(): boolean {
    return this.userRole === 'ROLE_ADMIN' || this.userRole === 'ROLE_MANAGER' || this.userRole === 'ROLE_HR';
  }

  get doneTasksCount(): number {
    return this.tasks.filter(t => t.status === 'DONE').length;
  }

  get openBugsCount(): number {
    return this.tasks.filter(t => t.taskType === 'BUG' && t.status === 'DONE').length;
  }


  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
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

  loadSprintAnalytics(): void {
    this.taskService.getSprintAnalytics().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.sprintMetrics = res.data;
        }
      },
      error: () => {}
    });
  }

  switchViewMode(mode: 'KANBAN' | 'LIST'): void {
    this.viewMode = mode;
  }

  get filteredTasksList(): TaskItem[] {
    return this.tasks.filter(t => {
      const matchesSearch = !this.searchQuery || 
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (t.tags && t.tags.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesPriority = !this.filterPriority || t.priority === this.filterPriority;
      const matchesType = !this.filterType || t.taskType === this.filterType;
      const matchesDept = !this.filterDepartment || t.department === this.filterDepartment;
      const matchesAssignee = !this.filterAssigneeId || t.assigneeId === Number(this.filterAssigneeId);

      return matchesSearch && matchesPriority && matchesType && matchesDept && matchesAssignee;
    });
  }

  getTasksByStatus(status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'): TaskItem[] {
    return this.filteredTasksList.filter(t => t.status === status);
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
        next: () => {
          this.loadSprintAnalytics();
        },
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
          this.loadSprintAnalytics();
        },
        error: () => {
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
      department: 'IT',
      estimatedHours: 8.0,
      loggedHours: 0.0,
      tags: ''
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
          this.loadSprintAnalytics();
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

  // Detailed Task & Collaboration Modal
  openTaskDetail(task: TaskItem): void {
    this.selectedTaskForDetail = task;
    this.showDetailModal = true;
    this.activeDetailTab = 'SUBTASKS';
    this.newSubtaskTitle = '';
    this.newCommentContent = '';
    this.logHoursAmount = 1.0;
    this.logHoursDescription = '';

    if (task.id) {
      this.taskService.getTaskById(task.id).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.selectedTaskForDetail = res.data;
          }
        },
        error: () => {}
      });
    }
  }

  closeTaskDetail(): void {
    this.showDetailModal = false;
    this.selectedTaskForDetail = null;
    this.loadTasks();
  }

  addSubTask(): void {
    if (!this.newSubtaskTitle.trim() || !this.selectedTaskForDetail?.id) return;

    const taskId = this.selectedTaskForDetail.id;
    const title = this.newSubtaskTitle.trim();

    this.taskService.addSubTask(taskId, title).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedTaskForDetail) {
          if (!this.selectedTaskForDetail.subTasks) {
            this.selectedTaskForDetail.subTasks = [];
          }
          this.selectedTaskForDetail.subTasks.push(res.data);
        }
        this.newSubtaskTitle = '';
      },
      error: () => {
        if (this.selectedTaskForDetail) {
          if (!this.selectedTaskForDetail.subTasks) this.selectedTaskForDetail.subTasks = [];
          this.selectedTaskForDetail.subTasks.push({ id: Date.now(), title, completed: false });
        }
        this.newSubtaskTitle = '';
      }
    });
  }

  toggleSubTask(sub: SubTask): void {
    sub.completed = !sub.completed;
    if (sub.id) {
      this.taskService.toggleSubTask(sub.id).subscribe({ error: () => {} });
    }
  }

  getSubTaskProgressPercentage(task: TaskItem): number {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter(s => s.completed).length;
    return Math.round((completed / task.subTasks.length) * 100);
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.selectedTaskForDetail?.id) return;

    const taskId = this.selectedTaskForDetail.id;
    const content = this.newCommentContent.trim();
    const author = this.currentUserName;

    this.taskService.addComment(taskId, author, content).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedTaskForDetail) {
          if (!this.selectedTaskForDetail.comments) this.selectedTaskForDetail.comments = [];
          this.selectedTaskForDetail.comments.push(res.data);
        }
        this.newCommentContent = '';
      },
      error: () => {
        if (this.selectedTaskForDetail) {
          if (!this.selectedTaskForDetail.comments) this.selectedTaskForDetail.comments = [];
          this.selectedTaskForDetail.comments.push({ id: Date.now(), authorName: author, content, createdAt: new Date().toISOString() });
        }
        this.newCommentContent = '';
      }
    });
  }

  logWorkHours(): void {
    if (!this.selectedTaskForDetail?.id || this.logHoursAmount <= 0) return;

    const taskId = this.selectedTaskForDetail.id;
    const empId = this.selectedTaskForDetail.assigneeId || this.currentUserId;
    const hours = this.logHoursAmount;
    const desc = this.logHoursDescription;

    this.taskService.logTime(taskId, empId, hours, desc).subscribe({
      next: (res) => {
        if (res && res.data && this.selectedTaskForDetail) {
          if (!this.selectedTaskForDetail.timeLogs) this.selectedTaskForDetail.timeLogs = [];
          this.selectedTaskForDetail.timeLogs.unshift(res.data);
          this.selectedTaskForDetail.loggedHours = (this.selectedTaskForDetail.loggedHours || 0) + hours;
        }
        this.logHoursDescription = '';
        this.loadSprintAnalytics();
        alert(`Successfully logged ${hours} hours!`);
      },
      error: () => {
        if (this.selectedTaskForDetail) {
          this.selectedTaskForDetail.loggedHours = (this.selectedTaskForDetail.loggedHours || 0) + hours;
        }
        this.logHoursDescription = '';
        alert(`Logged ${hours} hours!`);
      }
    });
  }

  // Employee Performance & Bug Tracking Inspector Modal
  inspectEmployeeAnalytics(employeeId: number): void {
    this.selectedAnalyticsEmployeeId = employeeId;
    this.showEmployeeAnalyticsModal = true;
    this.employeeAnalyticsData = null;

    this.taskService.getEmployeeAnalytics(employeeId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.employeeAnalyticsData = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching employee analytics:', err);
      }
    });
  }

  closeEmployeeAnalyticsModal(): void {
    this.showEmployeeAnalyticsModal = false;
    this.selectedAnalyticsEmployeeId = null;
    this.employeeAnalyticsData = null;
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
        estimatedHours: 12.0,
        loggedHours: 10.5,
        tags: 'Gateway,Security,SpringCloud',
        createdAt: '2026-08-11T10:00:00',
        subTasks: [
          { id: 101, title: 'Configure route predicates', completed: true },
          { id: 102, title: 'Verify header deduplication', completed: true }
        ],
        comments: [
          { id: 201, authorName: 'Raman', content: 'Ingress routing verified across all microservices.', createdAt: '2026-08-11T12:00:00' }
        ]
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
        estimatedHours: 16.0,
        loggedHours: 6.0,
        tags: 'Angular,Frontend,Architecture',
        createdAt: '2026-08-11T11:30:00',
        subTasks: [
          { id: 103, title: 'Create standalone feature modules', completed: true },
          { id: 104, title: 'Implement Amazon sliding sidebar', completed: false }
        ]
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
        estimatedHours: 20.0,
        loggedHours: 18.0,
        tags: 'AI,Nvidia,LLM',
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
        estimatedHours: 4.0,
        loggedHours: 3.5,
        tags: 'BugFix,CORS,Auth',
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
        estimatedHours: 8.0,
        loggedHours: 0.0,
        tags: 'Payroll,Audit',
        createdAt: '2026-08-12T09:15:00'
      }
    ];
  }
}
