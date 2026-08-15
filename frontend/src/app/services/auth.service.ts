import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../models/user';

// Wrapper response from backend
interface ApiResponse<T> {
  message: string;
  data: T;
  timeStamp: string;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const savedUser = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
    console.log('AuthService initialized, user:', savedUser);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login for:', credentials.username);
    
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          console.log('Raw response:', response);
          return response.data;
        }),
        tap((authResponse) => {
          console.log('Extracted auth response:', authResponse);
          this.handleAuthResponse(authResponse);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return this.handleError(error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => response.data),
        tap((response) => this.handleAuthResponse(response)),
        catchError(this.handleError),
      );
  }

  logout(): void {
    console.log('Logging out, clearing storage');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('Getting token:', token ? 'Token exists (length: ' + token.length + ')' : 'No token');
    return token;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('isLoggedIn: No token found');
      return false;
    }
    
    const isValid = !this.isTokenExpired(token);
    console.log('isLoggedIn:', isValid);
    return isValid;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expired = payload.exp < Date.now() / 1000;
      if (expired) {
        console.log('Token expired, logging out');
        this.logout();
      }
      return expired;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  private handleAuthResponse(response: any): void {
    console.log('handleAuthResponse called with:', response);
    
    const token = response?.token || response?.accessToken;
    const user = response?.user || response?.userInfo;

    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('Token saved to localStorage');
      
      if (user) {
        if (user.roles && Array.isArray(user.roles)) {
          const roleList = user.roles.map((r: any) => typeof r === 'string' ? r : r.name);
          if (roleList.includes('ROLE_ADMIN') || roleList.includes('ADMIN')) {
            user.role = 'ROLE_ADMIN';
          } else if (roleList.includes('ROLE_MANAGER') || roleList.includes('MANAGER')) {
            user.role = 'ROLE_MANAGER';
          } else if (roleList.includes('ROLE_HR') || roleList.includes('HR')) {
            user.role = 'ROLE_HR';
          } else if (roleList.length > 0) {
            user.role = roleList[0];
          }
        }
        if (!user.role) {
          user.role = 'ROLE_ADMIN';
        }
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        console.log('User info saved:', user);
        this.currentUserSubject.next(user);
      }

      
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      console.log('Verification - Token saved:', savedToken ? 'Yes' : 'No');
    } else {
      console.error('No access token in response:', response);
    }
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.role && user.roles && user.roles.length > 0) {
          user.role = user.roles[0];
        }
        return user;
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        return null;
      }
    }
    return null;
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.data?.message) {
      errorMessage = error.error.data.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (error.status === 403) {
      errorMessage = "Access denied. You don't have permission.";
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 8080';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    console.error('Auth error:', error);
    return throwError(() => new Error(errorMessage));
  }

  hasRole(role: string): boolean {
    return this.hasAnyRole([role]);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;

    const userRoles: string[] = [];
    if (user.role) userRoles.push(user.role);
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach((r: any) => {
        if (typeof r === 'string') userRoles.push(r);
        else if (r && r.name) userRoles.push(r.name);
      });
    }

    const normalizedUserRoles = new Set<string>();
    userRoles.forEach((r) => {
      if (r) {
        normalizedUserRoles.add(r.toUpperCase());
        if (r.toUpperCase().startsWith('ROLE_')) {
          normalizedUserRoles.add(r.toUpperCase().replace('ROLE_', ''));
        } else {
          normalizedUserRoles.add('ROLE_' + r.toUpperCase());
        }
      }
    });

    return roles.some((req) => {
      if (!req) return false;
      const upperReq = req.toUpperCase();
      return (
        normalizedUserRoles.has(upperReq) ||
        (upperReq.startsWith('ROLE_') && normalizedUserRoles.has(upperReq.replace('ROLE_', ''))) ||
        (!upperReq.startsWith('ROLE_') && normalizedUserRoles.has('ROLE_' + upperReq))
      );
    });
  }
}