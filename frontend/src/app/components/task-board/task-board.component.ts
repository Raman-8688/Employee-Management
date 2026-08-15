import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, TaskItem, SubTask, TaskComment, TaskTimeLog, SprintMetrics, EmployeeTaskAnalytics, TaskLearning } from '../../services/task.service';
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
  myTasks: TaskItem[] = [];
  employees: Employee[] = [];
  draggedTask: TaskItem | null = null;

  // Active View Mode: KANBAN | MY_WORK | TIME_LOGS | ANALYTICS | LEARNINGS
  activeViewMode: 'KANBAN' | 'MY_WORK' | 'TIME_LOGS' | 'ANALYTICS' | 'LEARNINGS' = 'KANBAN';

  // Filter Models
  searchQuery = '';
  filterPriority = '';
  filterType = '';
  filterDepartment = '';
  filterAssigneeId: number | null = null;
  filterLearningCategory = 'ALL';
  learningSearchQuery = '';

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
  activeDetailTab: 'SUBTASKS' | 'COMMENTS' | 'TIMELOGS' | 'LEARNINGS' = 'SUBTASKS';
  newSubtaskTitle = '';
  newCommentContent = '';
  logHoursAmount = 1.0;
  logHoursDescription = '';

  // Task Learnings Module State
  learnings: TaskLearning[] = [];
  showLearningModal = false;
  selectedLearningFile: File | null = null;
  isUploadingLearningFile = false;

  learningForm: TaskLearning = {
    title: '',
    category: 'TECHNICAL',
    content: '',
    attachmentUrl: '',
    fileType: ''
  };

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
    private confirmDialogService: ConfirmDialogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userRole = user?.role || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_EMPLOYEE');
    if (user) {
      this.currentUserId = user.id || 1;
      this.currentUserName = (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username) || 'User';
    }

    if (this.router.url.includes('/learnings')) {
      this.activeViewMode = 'LEARNINGS';
    }

    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        const v = params['view'].toUpperCase();
        if (['KANBAN', 'MY_WORK', 'TIME_LOGS', 'ANALYTICS', 'LEARNINGS'].includes(v)) {
          this.activeViewMode = v as any;
        }
      }
    });

    this.loadTasks();
    this.loadEmployees();
    this.loadSprintAnalytics();
    this.loadLearnings();
  }

  get isAdminOrManager(): boolean {
    return this.userRole === 'ROLE_ADMIN' || this.userRole === 'ROLE_MANAGER' || this.userRole === 'ROLE_HR';
  }

  canModifyTask(task: TaskItem): boolean {
    if (this.isAdminOrManager) return true;
    return task.assigneeId === Number(this.currentUserId);
  }

  get doneTasksCount(): number {
    return this.tasks.filter(t => t.status === 'DONE').length;
  }

  get openBugsCount(): number {
    return this.tasks.filter(t => t.taskType === 'BUG' && t.status !== 'DONE').length;
  }

  get technicalLearningsCount(): number {
    return this.learnings.filter(l => l.category === 'TECHNICAL').length;
  }

  get securityLearningsCount(): number {
    return this.learnings.filter(l => l.category === 'SECURITY').length;
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
        this.myTasks = this.tasks.filter(t => t.assigneeId === Number(this.currentUserId));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tasks:', err);
        this.tasks = this.getMockTasks();
        this.myTasks = this.tasks.filter(t => t.assigneeId === Number(this.currentUserId));
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

  loadLearnings(): void {
    this.taskService.getLearnings(this.filterLearningCategory, this.learningSearchQuery).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.learnings = res.data;
        } else {
          this.learnings = this.getMockLearnings();
        }
      },
      error: () => {
        this.learnings = this.getMockLearnings();
      }
    });
  }

  switchViewMode(mode: 'KANBAN' | 'MY_WORK' | 'TIME_LOGS' | 'ANALYTICS' | 'LEARNINGS'): void {
    this.activeViewMode = mode;
  }

  get filteredTasksList(): TaskItem[] {
    const listToFilter = (this.activeViewMode === 'MY_WORK') ? this.myTasks : this.tasks;

    return listToFilter.filter(t => {
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

  get allTimeLogs(): TaskTimeLog[] {
    const logs: TaskTimeLog[] = [];
    this.tasks.forEach(t => {
      if (t.timeLogs) {
        t.timeLogs.forEach(l => {
          logs.push({
            ...l,
            description: l.description ? `${t.title}: ${l.description}` : t.title
          });
        });
      }
    });
    return logs;
  }

  getTasksByStatus(status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'): TaskItem[] {
    return this.filteredTasksList.filter(t => t.status === status);
  }

  // HTML Drag & Drop Implementation with RBAC & Automated Duration Sync
  onDragStart(event: DragEvent, task: TaskItem): void {
    if (!this.canModifyTask(task)) {
      alert('Access Denied: Standard employees can only drag/move tasks assigned to them.');
      event.preventDefault();
      return;
    }

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
      if (!this.canModifyTask(this.draggedTask)) {
        alert('Access Denied: Standard employees can only update tasks assigned to them.');
        this.draggedTask = null;
        return;
      }
      this.moveTask(this.draggedTask, targetStatus);
    }
    this.draggedTask = null;
  }

  moveTask(task: TaskItem, newStatus: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'): void {
    const oldStatus = task.status;
    task.status = newStatus;

    if (task.id) {
      this.taskService.updateTaskStatus(task.id, newStatus, this.currentUserId, this.userRole).subscribe({
        next: () => {
          this.loadTasks();
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
    if (!this.canModifyTask(task)) {
      alert('Access Denied: Standard employees can only delete tasks assigned to them.');
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
      this.taskService.deleteTask(task.id, this.currentUserId, this.userRole).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.loadTasks();
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
      assigneeId: this.currentUserId,
      estimatedHours: 8.0,
      loggedHours: 0.0,
      tags: ''
    };
    this.showTaskModal = true;
  }

  openEditTaskModal(task: TaskItem): void {
    if (!this.canModifyTask(task)) {
      alert('Access Denied: Standard employees can only edit tasks assigned to them.');
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
      this.taskService.updateTask(this.taskForm.id, this.taskForm, this.currentUserId, this.userRole).subscribe({
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

  // Detailed Task Modal
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

  // TASK LEARNINGS & ATTACHMENTS FILE HANDLING
  openCreateLearningModal(task?: TaskItem): void {
    this.selectedLearningFile = null;
    this.isUploadingLearningFile = false;
    this.learningForm = {
      taskId: task?.id || this.selectedTaskForDetail?.id,
      taskTitle: task?.title || this.selectedTaskForDetail?.title,
      employeeId: this.currentUserId,
      employeeName: this.currentUserName,
      title: '',
      category: 'TECHNICAL',
      content: '',
      attachmentUrl: '',
      fileType: ''
    };
    this.showLearningModal = true;
  }

  closeLearningModal(): void {
    this.showLearningModal = false;
    this.selectedLearningFile = null;
    this.isUploadingLearningFile = false;
  }

  onLearningFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedLearningFile = event.target.files[0];
    }
  }

  submitLearningForm(): void {
    if (!this.learningForm.title.trim() || !this.learningForm.content.trim()) {
      alert('Please fill out both the lesson title and lesson content.');
      return;
    }

    if (this.selectedLearningFile) {
      this.isUploadingLearningFile = true;
      this.taskService.uploadLearningAttachment(this.selectedLearningFile).subscribe({
        next: (uploadRes) => {
          if (uploadRes && uploadRes.data) {
            this.learningForm.attachmentUrl = uploadRes.data.fileUrl;
            this.learningForm.fileType = uploadRes.data.fileType;
          }
          this.saveLearningRecord();
        },
        error: (err) => {
          console.error('File upload failed, saving text record:', err);
          this.saveLearningRecord();
        }
      });
    } else {
      this.saveLearningRecord();
    }
  }

  private saveLearningRecord(): void {
    this.taskService.createLearning(this.learningForm).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.learnings.unshift(res.data);
        }
        this.closeLearningModal();
        alert('Task Learning & Best Practice documented successfully!');
      },
      error: () => {
        this.learnings.unshift({
          ...this.learningForm,
          id: Date.now(),
          createdAt: new Date().toISOString()
        });
        this.closeLearningModal();
        alert('Task Learning & Best Practice documented!');
      }
    });
  }

  // Employee Analytics Inspector Modal
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

  private getMockLearnings(): TaskLearning[] {
    return [
      {
        id: 1,
        taskId: 1,
        taskTitle: 'Configure Spring Cloud Gateway Dynamic Ingress',
        employeeId: 1,
        employeeName: 'Raman',
        title: 'Header Deduplication Filter Syntax in Gateway 4.1+',
        category: 'ARCHITECTURE',
        content: 'When configuring CORS in Spring Cloud Gateway alongside controller CORS annotations, duplicate headers trigger ERR_FAILED. Centralizing CORS in Gateway globalcors and removing controller @CrossOrigin prevents duplicate Access-Control-Allow-Origin headers.',
        attachmentUrl: 'http://localhost:8080/uploads/learnings/gateway-cors-guide.pdf',
        fileType: 'PDF',
        createdAt: '2026-08-13T10:00:00'
      },
      {
        id: 2,
        taskId: 4,
        taskTitle: 'Fix CORS Preflight Headers on Auth Controller',
        employeeId: 1,
        employeeName: 'Raman',
        title: 'Handling OPTIONS Preflight Requests in Spring Security',
        category: 'SECURITY',
        content: 'Always configure requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() in SecurityFilterChain. This ensures preflight OPTIONS requests pass without 403 Forbidden before Authorization headers are validated.',
        attachmentUrl: 'http://localhost:8080/uploads/learnings/security-options.docx',
        fileType: 'DOCX',
        createdAt: '2026-08-14T14:30:00'
      },
      {
        id: 3,
        taskId: 3,
        taskTitle: 'Integrate Nvidia Llama 3.1 8B AI Engine',
        employeeId: 3,
        employeeName: 'Shyam Sundar',
        title: 'Multi-Model Resilient Fallback Strategy for LLM APIs',
        category: 'TECHNICAL',
        content: 'External LLM APIs can hit rate limits or 429 quota exhaustion. Implement fallback model lists (meta/llama-3.1-70b-instruct, mistralai/mistral-7b-instruct-v0.2) and local MNC HR fallback text generators to ensure 100% uptime for end users.',
        attachmentUrl: 'http://localhost:8080/uploads/learnings/llm-fallback-diagram.png',
        fileType: 'PNG',
        createdAt: '2026-08-15T09:00:00'
      }
    ];
  }
}
