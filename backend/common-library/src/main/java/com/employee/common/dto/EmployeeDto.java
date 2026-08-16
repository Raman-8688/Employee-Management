package com.employee.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Long id;
    private String name;
    private String email;
    private String department;
    private Double sal;
    private String profileImageUrl;
    private String status; // ACTIVE, ONBOARDING, OFFBOARDING, TERMINATED
    private java.time.LocalDate joiningDate;
    private String techStackSummary;
    private java.util.Set<String> roles;
}

