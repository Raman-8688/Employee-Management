import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/employee';

  constructor(private http: HttpClient) {}

  getEmployee(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/details/${id}`);
  }

  saveEmployee(employee: Employee): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, employee);
  }

  updateEmployee(employee: Employee): Observable<any> {
    return this.http.patch(`${this.baseUrl}/update`, employee);
  }

  fullUpdateEmployee(employee: Employee): Observable<any> {
    return this.http.put(`${this.baseUrl}/full-update`, employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  findAllEmployee(): Observable<any> {
    return this.http.get(`${this.baseUrl}/findAll`);
  }

  searchEmployees(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/search`, request);
  }
}
