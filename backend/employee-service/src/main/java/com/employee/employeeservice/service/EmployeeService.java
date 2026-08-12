package com.employee.employeeservice.service;

import com.employee.common.dto.EmployeeDto;
import com.employee.employeeservice.entity.Employee;
import com.employee.employeeservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public List<Employee> findAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    public Employee saveEmployee(Employee employee) {
        if (employee.getStatus() == null) {
            employee.setStatus("Active");
        }
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee updated) {
        Employee emp = findById(id);
        if (updated.getName() != null) emp.setName(updated.getName());
        if (updated.getEmail() != null) emp.setEmail(updated.getEmail());
        if (updated.getDepartment() != null) emp.setDepartment(updated.getDepartment());
        if (updated.getSal() != null) emp.setSal(updated.getSal());
        if (updated.getProfileImageUrl() != null) emp.setProfileImageUrl(updated.getProfileImageUrl());
        if (updated.getStatus() != null) emp.setStatus(updated.getStatus());
        return employeeRepository.save(emp);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    public EmployeeDto getEmployeeDtoById(Long id) {
        Employee emp = findById(id);
        return EmployeeDto.builder()
                .id(emp.getId())
                .name(emp.getName())
                .email(emp.getEmail())
                .department(emp.getDepartment())
                .sal(emp.getSal())
                .profileImageUrl(emp.getProfileImageUrl())
                .status(emp.getStatus())
                .build();
    }
}
