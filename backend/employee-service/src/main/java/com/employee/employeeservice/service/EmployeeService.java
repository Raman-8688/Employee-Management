package com.employee.employeeservice.service;

import com.employee.common.dto.EmployeeDto;
import com.employee.employeeservice.entity.Employee;
import com.employee.employeeservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;


import com.employee.employeeservice.client.NotificationEventDispatcher;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final NotificationEventDispatcher notificationEventDispatcher;

    public List<Employee> findAllEmployees() {
        return employeeRepository.findAll();
    }

    public boolean existsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return false;
        return employeeRepository.existsByEmail(email.trim());
    }

    public Employee findById(Long id) {

        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    public Employee saveEmployee(Employee employee) {
        if (employee.getEmail() != null && employeeRepository.existsByEmail(employee.getEmail().trim())) {
            throw new IllegalArgumentException("An employee with this email address ('" + employee.getEmail() + "') already exists. Please use a unique email address.");
        }
        if (employee.getStatus() == null || employee.getStatus().trim().isEmpty()) {
            employee.setStatus("ACTIVE");
        }
        if (employee.getJoiningDate() == null) {
            employee.setJoiningDate(java.time.LocalDate.now());
        }
        if (employee.getRoles() == null || employee.getRoles().isEmpty()) {
            java.util.Set<String> defaultRoles = new java.util.HashSet<>();
            defaultRoles.add("ROLE_EMPLOYEE");
            employee.setRoles(defaultRoles);
        }
        Employee saved = employeeRepository.save(employee);
        notificationEventDispatcher.dispatchEmployeeOnboardedNotification(saved);
        return saved;
    }

    public Employee updateEmployee(Long id, Employee updated) {
        Employee emp = findById(id);
        if (updated.getEmail() != null && !updated.getEmail().trim().equalsIgnoreCase(emp.getEmail())) {
            if (employeeRepository.existsByEmailAndIdNot(updated.getEmail().trim(), id)) {
                throw new IllegalArgumentException("An employee with this email address ('" + updated.getEmail() + "') already exists. Please use a unique email address.");
            }
            emp.setEmail(updated.getEmail().trim());
        }
        if (updated.getName() != null) emp.setName(updated.getName());
        if (updated.getDepartment() != null) emp.setDepartment(updated.getDepartment());
        if (updated.getSal() != null) emp.setSal(updated.getSal());
        if (updated.getProfileImageUrl() != null) emp.setProfileImageUrl(updated.getProfileImageUrl());
        if (updated.getStatus() != null) emp.setStatus(updated.getStatus());
        if (updated.getJoiningDate() != null) emp.setJoiningDate(updated.getJoiningDate());
        if (updated.getTechStackSummary() != null) emp.setTechStackSummary(updated.getTechStackSummary());
        if (updated.getRoles() != null && !updated.getRoles().isEmpty()) emp.setRoles(updated.getRoles());

        Employee saved = employeeRepository.save(emp);
        notificationEventDispatcher.dispatchEmployeeUpdatedNotification(saved);
        return saved;
    }




    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }

    public Map<String, Object> getEmployeeAnalytics() {
        List<Employee> all = employeeRepository.findAll();
        long total = all.size();
        long active = all.stream().filter(e -> e.getStatus() == null || !"Inactive".equalsIgnoreCase(e.getStatus())).count();
        long onboarding = all.stream().filter(e -> "Onboarding".equalsIgnoreCase(e.getStatus())).count();
        long offboarding = all.stream().filter(e -> "Offboarding".equalsIgnoreCase(e.getStatus()) || "Inactive".equalsIgnoreCase(e.getStatus())).count();

        double monthlyBurnRate = all.stream()
                .filter(e -> e.getSal() != null)
                .mapToDouble(Employee::getSal)
                .sum();

        java.util.Map<String, Long> deptCounts = all.stream()
                .filter(e -> e.getDepartment() != null && !e.getDepartment().trim().isEmpty())
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("totalEmployees", total);
        response.put("activeEmployees", active);
        response.put("onboardingEmployees", onboarding);
        response.put("offboardingEmployees", offboarding);
        response.put("monthlyPayrollBurnRate", monthlyBurnRate);
        response.put("departmentBreakdown", deptCounts);
        return response;
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
                .joiningDate(emp.getJoiningDate())
                .techStackSummary(emp.getTechStackSummary())
                .roles(emp.getRoles())
                .build();
    }

}
