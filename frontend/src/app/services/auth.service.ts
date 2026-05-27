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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
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
          // Extract the nested data
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

  private handleAuthResponse(response: AuthResponse): void {
    console.log('handleAuthResponse called with:', response);
    
    if (response && response.accessToken) {
      // Save token
      localStorage.setItem(this.TOKEN_KEY, response.accessToken);
      console.log('Token saved to localStorage');
      
      // Save user info
      if (response.userInfo) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.userInfo));
        console.log('User info saved:', response.userInfo);
        
        // Update BehaviorSubject
        this.currentUserSubject.next(response.userInfo);
      }
      
      // Verify token was saved
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      console.log('Verification - Token saved:', savedToken ? 'Yes' : 'No');
      console.log('Verification - Token length:', savedToken?.length);
    } else {
      console.error('No access token in response:', response);
    }
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Retrieved user from storage:', user);
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

    // Check if error has the wrapped response
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
    const user = this.currentUserValue;
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return user ? roles.includes(user.role) : false;
  }
}