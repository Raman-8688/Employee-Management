import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isCollapsed = false;

menuItems: MenuItem[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/dashboard/home' },
  { icon: 'groups', label: 'People', route: '/dashboard/people', badge: 12 },
  { icon: 'payments', label: 'Payroll', route: '/dashboard/payroll' },
  { icon: 'schedule', label: 'Time Tools', route: '/dashboard/time-tools' },
  { icon: 'verified_user', label: 'Bonified', route: '/dashboard/bonified' },
  { icon: 'insights', label: 'Performance', route: '/dashboard/performance' },
  { icon: 'badge', label: 'Personal Details', route: '/dashboard/personal' },
  { icon: 'work_history', label: 'Job & Reference', route: '/dashboard/job' },
  { icon: 'description', label: 'Document', route: '/dashboard/document' }
];

  // getIcon(iconName: string): string {
  //   const icons: { [key: string]: string } = {
  //     dashboard: '📊',
  //     people: '👥',
  //     payments: '💰',
  //     schedule: '⏰',
  //     verified: '✅',
  //     trending_up: '📈',
  //     person: '👤',
  //     work: '💼',
  //     description: '📄'
  //   };
  //   return icons[iconName] || '📌';
  // }
}