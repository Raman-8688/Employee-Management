package com.employee.backend.service;

import com.employee.backend.entity.Employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeService  {

    Optional<Employee> getEmployeeDetail(Long id);

    Employee saveEmployeeDetails(Employee employee);

    Employee updateEmployeeDetails(Employee employee);

    Employee updateFullEmployeeDetails(Employee employee);

    void deleteEmployee(Long id);

    List<Employee> findAllEmployee();
}
