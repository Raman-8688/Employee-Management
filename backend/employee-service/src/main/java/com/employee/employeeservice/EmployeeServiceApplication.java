package com.employee.employeeservice;

import com.employee.employeeservice.entity.Employee;
import com.employee.employeeservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.stereotype.Component;

@SpringBootApplication
@EnableDiscoveryClient
public class EmployeeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeServiceApplication.class, args);
    }

    @Component
    @RequiredArgsConstructor
    public static class EmployeeDataInitializer implements CommandLineRunner {

        private final EmployeeRepository employeeRepository;

        @Override
        public void run(String... args) throws Exception {
            if (employeeRepository.count() == 0) {
                employeeRepository.save(Employee.builder()
                        .name("Raman")
                        .email("ramanms8688@gmail.com")
                        .department("IT")
                        .sal(15000.0)
                        .status("Active")
                        .build());

                employeeRepository.save(Employee.builder()
                        .name("Ramesh")
                        .email("ramesh@gmail.com")
                        .department("IT")
                        .sal(20000.0)
                        .status("Active")
                        .build());

                employeeRepository.save(Employee.builder()
                        .name("Shyam Sundar")
                        .email("shyam@gmail.com")
                        .department("IT")
                        .sal(23000.0)
                        .status("Active")
                        .build());

                employeeRepository.save(Employee.builder()
                        .name("Vikash")
                        .email("viky@gmail.com")
                        .department("Operations")
                        .sal(25000.0)
                        .status("Active")
                        .build());
            }
        }
    }
}
