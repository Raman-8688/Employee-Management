package com.employee.backend.service.iml;

import com.employee.backend.entity.Employee;
import com.employee.backend.exception.EmployeeNotFoundException;
import com.employee.backend.reopository.EmployeeRepository;
import com.employee.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeServiceIMP implements EmployeeService {

    private final EmployeeRepository employeeRepository;


    @Override
    public Optional<Employee> getEmployeeDetail(Long id) {
        return employeeRepository.findById(id);
    }

    @Override
    public Employee saveEmployeeDetails(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateFullEmployeeDetails(Employee employee) {

        if(employee.getId()==null){
            throw new IllegalArgumentException("Employee ID must be provided for full update");

        }
        employeeRepository.findById(employee.getId()).orElseThrow(()->
                new EmployeeNotFoundException("Employee not found"+employee.getId()));
        return employeeRepository.save(employee);
    }
    @Override
    public Employee updateEmployeeDetails(Employee employee) {
        Employee existing = employeeRepository.findById(employee.getId())
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        if (employee.getName() != null) {
            existing.setName(employee.getName());
        }
        if (employee.getDepartment() != null) {
            existing.setDepartment(employee.getDepartment());
        }
        if(employee.getEmail()!=null){
          existing.setEmail(employee.getEmail());
        }
        if(employee.getSal()!=null){
            existing.setSal(employee.getSal());
        }

        return employeeRepository.save(existing);
    }


    @Override
    public void deleteEmployee(Long id) {
          employeeRepository.deleteById(id);
    }

    @Override
    public List<Employee> findAllEmployee() {
        return employeeRepository.findAll();
    }
}
