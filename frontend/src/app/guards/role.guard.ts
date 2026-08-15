import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = this.authService.hasAnyRole(requiredRoles);

    if (!hasRole) {
      const user = this.authService.currentUserValue;
      console.log(
        'Role access denied. User role:',
        user?.role,
        'Roles:',
        user?.roles,
        'Required roles:',
        requiredRoles,
      );
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
