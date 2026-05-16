package com.employee.backend.service.iml;

import com.employee.backend.dto.EmployeeSearchRequest;
import com.employee.backend.entity.Employee;
import com.employee.backend.exception.EmployeeNotFoundException;
import com.employee.backend.reopository.EmployeeRepository;
import com.employee.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;



import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

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



    @Override
    public Page<Employee> searchEmployees(EmployeeSearchRequest request) {

        Sort sort = request.getSortDir().equalsIgnoreCase("desc")
                ? Sort.by(request.getSortBy()).descending()
                : Sort.by(request.getSortBy()).ascending();

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                sort
        );

        Specification<Employee> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + request.getName().toLowerCase() + "%"
                ));
            }

            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("email")),
                        "%" + request.getEmail().toLowerCase() + "%"
                ));
            }

            if (request.getDepartment() != null && !request.getDepartment().trim().isEmpty()) {
                predicates.add(cb.like(
                        cb.lower(root.get("department")),
                        "%" + request.getDepartment().toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return employeeRepository.findAll(spec, pageable);
    }
}
