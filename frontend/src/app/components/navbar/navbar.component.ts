import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationItem } from '../../services/notification.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  showUserMenu = false;
  showNotifMenu = false;
  unreadCount = 3;
  quickNotifications: NotificationItem[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

    this.loadQuickNotifications();
  }

  loadQuickNotifications(): void {
    const user = this.authService.currentUserValue;
    const userId = user?.id || 1;
    this.notificationService.getUserNotifications(userId, 'ALL', true).subscribe({
      next: (res) => {
        if (res && res.data && res.data.length > 0) {
          this.quickNotifications = res.data.slice(0, 4);
        } else {
          this.quickNotifications = [
            { id: 1, recipientId: 1, title: 'Task Assigned: Configure Gateway Ingress', message: 'Assigned to Jira Issue #1', category: 'TASK', priority: 'HIGH', readStatus: false, createdAt: new Date().toISOString() },
            { id: 2, recipientId: 1, title: 'Annual Performance Review', message: 'Appraisal review published by HR', category: 'HR', priority: 'MEDIUM', readStatus: false, createdAt: new Date().toISOString() },
            { id: 3, recipientId: 1, title: 'Task Duration Sync Log', message: '3.5 work hours logged to ledger', category: 'ALERT', priority: 'MEDIUM', readStatus: false, createdAt: new Date().toISOString() }
          ];
        }
      },
      error: () => {}
    });
  }

  toggleMenu() {
    this.menuToggle.emit();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) this.showNotifMenu = false;
  }

  toggleNotifMenu() {
    this.showNotifMenu = !this.showNotifMenu;
    if (this.showNotifMenu) {
      this.showUserMenu = false;
      this.loadQuickNotifications();
    }
  }

  openNotificationCenter() {
    this.showNotifMenu = false;
    this.router.navigate(['/dashboard/notifications']);
  }

  markQuickRead(item: NotificationItem, event: MouseEvent) {
    event.stopPropagation();
    if (item.id && !item.readStatus) {
      item.readStatus = true;
      this.notificationService.markAsRead(item.id).subscribe({ error: () => {} });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    const user = this.authService.currentUserValue;
    return user ? `${user.firstName} ${user.lastName}` : 'User';
  }

  getUserRole(): string {
    const user = this.authService.currentUserValue;
    return user ? (user.role || 'ROLE_EMPLOYEE').replace('ROLE_', '') : '';
  }
}
