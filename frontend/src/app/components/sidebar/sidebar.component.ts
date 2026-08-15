import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
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

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard/home' },
    { icon: 'task_alt', label: 'Tasks & Projects', route: '/dashboard/tasks', badge: 4 },
    { icon: 'groups', label: 'People', route: '/dashboard/people', badge: 12 },
    { icon: 'payments', label: 'Payroll', route: '/dashboard/payroll' },
    { icon: 'schedule', label: 'Time Tools', route: '/dashboard/time-tools' },
    { icon: 'verified_user', label: 'Bonified', route: '/dashboard/bonified' },
    { icon: 'insights', label: 'Performance', route: '/dashboard/performance' },
    { icon: 'badge', label: 'Personal Details', route: '/dashboard/personal' },
    { icon: 'work_history', label: 'Job & Reference', route: '/dashboard/job' },
    { icon: 'description', label: 'Document', route: '/dashboard/document' },
    { icon: 'smart_toy', label: 'AI Copilot', route: '/dashboard/ai-copilot' }
  ];


  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
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