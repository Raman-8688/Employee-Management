import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

export interface SubMenuItem {
  icon: string;
  label: string;
  route: string;
  queryParams?: any;
  badge?: number;
}

export interface MenuItem {
  id?: string;
  icon: string;
  label: string;
  route?: string;
  queryParams?: any;
  badge?: number;
  subItems?: SubMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  user: any;
  activeCategory: MenuItem | null = null;

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard/home' },
    {
      id: 'tasks',
      icon: 'task_alt',
      label: 'Tasks & Projects',
      badge: 5,
      subItems: [
        { icon: 'view_kanban', label: 'Kanban Board', route: '/dashboard/tasks', queryParams: { view: 'KANBAN' } },
        { icon: 'assignment_ind', label: 'Backlog & My Work', route: '/dashboard/tasks', queryParams: { view: 'MY_WORK' } },
        { icon: 'history_toggle_off', label: 'Time Tracking Logs', route: '/dashboard/tasks', queryParams: { view: 'TIME_LOGS' } },
        { icon: 'query_stats', label: 'Sprint Analytics', route: '/dashboard/tasks', queryParams: { view: 'ANALYTICS' } },
        { icon: 'school', label: 'Learnings & Best Practices', route: '/dashboard/learnings', queryParams: { view: 'LEARNINGS' } }
      ]
    },
    {
      id: 'people',
      icon: 'groups',
      label: 'People',
      badge: 12,
      subItems: [
        { icon: 'contacts', label: 'Employee Directory', route: '/dashboard/people' },
        { icon: 'insights', label: 'Performance Reviews', route: '/dashboard/performance' },
        { icon: 'badge', label: 'Personal Details', route: '/dashboard/personal' },
        { icon: 'work_history', label: 'Job & Reference', route: '/dashboard/job' }
      ]
    },
    { icon: 'payments', label: 'Payroll', route: '/dashboard/payroll' },
    {
      id: 'time',
      icon: 'schedule',
      label: 'Time Tools',
      subItems: [
        { icon: 'alarm_on', label: 'Attendance Clock', route: '/dashboard/time-tools' },
        { icon: 'assignment', label: 'Timesheet Approvals', route: '/dashboard/time-tools' }
      ]
    },
    { icon: 'verified_user', label: 'Bonified', route: '/dashboard/bonified' },
    { icon: 'description', label: 'Document', route: '/dashboard/document' },
    { icon: 'smart_toy', label: 'AI Copilot', route: '/dashboard/ai-copilot' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
  }

  openSubmenu(item: MenuItem): void {
    if (item.subItems && item.subItems.length > 0) {
      this.activeCategory = item;
    }
  }

  closeSubmenu(): void {
    this.activeCategory = null;
  }

  getUserInitials(): string {
    if (this.user) {
      const first = this.user.firstName ? this.user.firstName.charAt(0) : '';
      const last = this.user.lastName ? this.user.lastName.charAt(0) : '';
      if (first || last) return `${first}${last}`.toUpperCase();
      if (this.user.username) return this.user.username.charAt(0).toUpperCase();
    }
    return 'A';
  }
}