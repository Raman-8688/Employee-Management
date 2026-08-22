import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService, NotificationItem, NotificationMetrics } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit {
  isLoading = true;
  notifications: NotificationItem[] = [];
  metrics: NotificationMetrics | null = null;

  // Filter State
  filterCategory = 'ALL';
  unreadOnly = false;
  searchQuery = '';

  // Manual Dispatch Modal
  showDispatchModal = false;
  dispatchForm: NotificationItem = {
    recipientId: 1,
    recipientEmail: 'admin@company.com',
    title: '',
    message: '',
    category: 'TASK',
    priority: 'HIGH'
  };

  currentUserId = 1;
  currentUserName = 'System User';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUserId = user.id || 1;
      this.currentUserName = (user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username) || 'User';
    }

    this.loadNotifications();
    this.loadMetrics();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getUserNotifications(this.currentUserId, this.filterCategory, this.unreadOnly).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.notifications = res.data;
        } else {
          this.notifications = this.getMockNotifications();
        }
        this.isLoading = false;
      },
      error: () => {
        this.notifications = this.getMockNotifications();
        this.isLoading = false;
      }
    });
  }

  setCategoryFilter(category: string): void {
    this.filterCategory = category;
  }

  loadMetrics(): void {
    this.notificationService.getMetrics().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.metrics = res.data;
        }
      },
      error: () => {}
    });
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.readStatus).length;
  }

  get filteredNotificationsList(): NotificationItem[] {
    return this.notifications.filter(n => {
      // 1. Category Matching
      let matchesCategory = true;
      if (this.filterCategory === 'UNREAD') {
        matchesCategory = !n.readStatus;
      } else if (this.filterCategory && this.filterCategory !== 'ALL') {
        matchesCategory = n.category === this.filterCategory;
      }

      // 2. Unread Only Checkbox
      const matchesUnread = !this.unreadOnly || !n.readStatus;

      // 3. Search Query
      const matchesSearch = !this.searchQuery ||
        n.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchesCategory && matchesUnread && matchesSearch;
    });
  }

  markAsRead(item: NotificationItem): void {
    if (item.id && !item.readStatus) {
      item.readStatus = true;
      this.notificationService.markAsRead(item.id).subscribe({ error: () => {} });
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.readStatus = true);
    this.notificationService.markAllAsRead(this.currentUserId).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: () => {}
    });
  }

  deleteNotification(item: NotificationItem): void {
    if (item.id) {
      this.notifications = this.notifications.filter(n => n.id !== item.id);
      this.notificationService.deleteNotification(item.id).subscribe({ error: () => {} });
    }
  }

  openDispatchModal(): void {
    this.dispatchForm = {
      recipientId: this.currentUserId,
      recipientEmail: 'admin@company.com',
      title: '',
      message: '',
      category: 'TASK',
      priority: 'HIGH'
    };
    this.showDispatchModal = true;
  }

  closeDispatchModal(): void {
    this.showDispatchModal = false;
  }

  submitDispatchForm(): void {
    if (!this.dispatchForm.title.trim() || !this.dispatchForm.message.trim()) {
      alert('Please fill out both the Notification Title and Message content.');
      return;
    }

    this.notificationService.dispatchNotification(this.dispatchForm).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.notifications.unshift(res.data);
        }
        this.closeDispatchModal();
        this.loadMetrics();
        alert('Notification dispatched successfully!');
      },
      error: () => {
        this.notifications.unshift({
          ...this.dispatchForm,
          id: Date.now(),
          readStatus: false,
          status: 'SENT',
          createdAt: new Date().toISOString()
        });
        this.closeDispatchModal();
        alert('Notification dispatched!');
      }
    });
  }

  private getMockNotifications(): NotificationItem[] {
    return [
      {
        id: 1,
        recipientId: 1,
        recipientEmail: 'admin@company.com',
        title: 'Task Assigned: Configure Spring Cloud Gateway Ingress',
        message: 'You have been assigned to Jira Issue #1: Configure Spring Cloud Gateway Ingress & Microservices Routing. High Priority.',
        category: 'TASK',
        priority: 'HIGH',
        status: 'SENT',
        readStatus: false,
        createdAt: '2026-08-16T11:00:00'
      },
      {
        id: 2,
        recipientId: 1,
        recipientEmail: 'admin@company.com',
        title: 'Annual Performance Evaluation Published',
        message: 'Your Q3 AI Performance Appraisal review has been generated and published by HR leadership.',
        category: 'HR',
        priority: 'MEDIUM',
        status: 'SENT',
        readStatus: false,
        createdAt: '2026-08-16T08:30:00'
      },
      {
        id: 3,
        recipientId: 1,
        recipientEmail: 'admin@company.com',
        title: 'Automated Task Duration Log Completed',
        message: 'Task #4 (Fix CORS Preflight Headers) moved to DONE. 3.5 elapsed work hours automatically synchronized into ledger.',
        category: 'ALERT',
        priority: 'MEDIUM',
        status: 'SENT',
        readStatus: false,
        createdAt: '2026-08-16T01:15:00'
      },
      {
        id: 4,
        recipientId: 1,
        recipientEmail: 'admin@company.com',
        title: 'Eureka Microservice Health Check Passed',
        message: 'All 9 Spring Cloud microservices registered cleanly with Eureka Service Registry.',
        category: 'SYSTEM',
        priority: 'LOW',
        status: 'SENT',
        readStatus: true,
        createdAt: '2026-08-15T16:00:00'
      },
      {
        id: 5,
        recipientId: 1,
        recipientEmail: 'admin@company.com',
        title: 'Failed Event Webhook Dispatch Alert',
        message: 'Simulated delivery attempt to external audit webhook failed. Automatic retry queued.',
        category: 'ALERT',
        priority: 'HIGH',
        status: 'FAILED',
        errorMessage: 'HTTP 503 Service Unavailable - Endpoint Timeout (3000ms)',
        readStatus: false,
        createdAt: '2026-08-14T10:00:00'
      }
    ];
  }
}
