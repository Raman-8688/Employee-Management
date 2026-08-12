package com.employee.taskservice.client;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "EMPLOYEE-SERVICE", path = "/employee")
public interface EmployeeClient {

    @GetMapping("/details/{id}")
    ApiResponse<EmployeeDto> getEmployeeById(@PathVariable("id") Long id);
}
