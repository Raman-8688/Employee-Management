package com.employee.backend.controller;

import com.employee.backend.dto.ApiResponse;
import com.employee.backend.dto.EmployeeSearchRequest;
import com.employee.backend.entity.Employee;
import com.employee.backend.exception.EmployeeNotFoundException;
import com.employee.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/employee")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/details/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeDetails(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeDetail(id)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found with id: " + id));
        return ResponseEntity.ok(new ApiResponse<>("Success", employee));
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Employee>> saveEmployeeDetails(@RequestBody Employee employee) {
        Employee saved = employeeService.saveEmployeeDetails(employee);
        return ResponseEntity.ok(new ApiResponse<>("Employee saved successfully", saved));
    }

    @PatchMapping("/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Employee>> updateEmployeeDetails(@RequestBody Employee employee) {
        Employee updated = employeeService.updateEmployeeDetails(employee);
        return ResponseEntity.ok(new ApiResponse<>("Employee updated successfully", updated));
    }

    @PutMapping("/full-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Employee>> updateFullEmployeeDetails(@RequestBody Employee employee){
        Employee employee1 = employeeService.updateFullEmployeeDetails(employee);
        return ResponseEntity.ok(new ApiResponse<>("Employee updated successfully", employee1));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(new ApiResponse<>("Employee deleted successfully", null));
    }

    @GetMapping("/findAll")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<Employee>>> findAllEmployee(){
        List<Employee> list = employeeService.findAllEmployee();
        return ResponseEntity.ok(new ApiResponse<>("List of Employees find successfully", list));
    }

    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<ApiResponse<Page<Employee>>> searchEmployees(@RequestBody EmployeeSearchRequest request) {
        Page<Employee> result = employeeService.searchEmployees(request);
        return ResponseEntity.ok(new ApiResponse<>("Employees fetched successfully", result));
    }
}