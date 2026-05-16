import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'people', pathMatch: 'full' },
      { path: 'home', component: EmployeeListComponent },
      { path: 'people', component: EmployeeListComponent },
      { path: 'payroll', component: EmployeeListComponent },
      { path: 'time-tools', component: EmployeeListComponent },
      { path: 'bonified', component: EmployeeListComponent },
      { path: 'performance', component: EmployeeListComponent },
      { path: 'personal', component: EmployeeListComponent },
      { path: 'job', component: EmployeeListComponent },
      { path: 'document', component: EmployeeListComponent }
    ]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
