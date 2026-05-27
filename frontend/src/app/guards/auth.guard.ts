import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean {
  console.log('AuthGuard - Checking auth');
  console.log('Is logged in:', this.authService.isLoggedIn());
  
  if (this.authService.isLoggedIn()) {
    console.log('AuthGuard - Access granted');
    return true;
  }

  console.log('AuthGuard - Access denied, redirecting to login');
  this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
}
}
