import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';

import { PayrollComponent } from './components/payroll/payroll.component';

import { TimeToolsComponent } from './components/time-tools/time-tools.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },
  {
    path: 'dashboard',
    component: DashboardComponent, // Use your existing DashboardComponent directly
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: DashboardOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'people',
        component: EmployeeListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'payroll',
        component: PayrollComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'time-tools',
        component: TimeToolsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'bonified',
        component: EmployeeListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'performance',
        component: EmployeeListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'personal',
        component: EmployeeListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'job',
        component: EmployeeListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'document',
        component: EmployeeListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'ai-copilot',
        loadComponent: () =>
          import('./components/ai-copilot/ai-copilot.component').then(
            (m) => m.AiCopilotComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./components/task-board/task-board.component').then(
            (m) => m.TaskBoardComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'learnings',
        loadComponent: () =>
          import('./components/task-board/task-board.component').then(
            (m) => m.TaskBoardComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./components/project-knowledge/project-knowledge.component').then(
            (m) => m.ProjectKnowledgeComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./components/notification-center/notification-center.component').then(
            (m) => m.NotificationCenterComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER'] },
      },




    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Start with login
  { path: '**', redirectTo: '/login' },
];
