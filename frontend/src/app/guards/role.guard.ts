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

    const user = this.authService.currentUserValue;
    const hasRole = user ? requiredRoles.includes(user.role) : false;

    if (!hasRole) {
      console.log(
        'Role access denied. User role:',
        user?.role,
        'Required roles:',
        requiredRoles,
      );
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
