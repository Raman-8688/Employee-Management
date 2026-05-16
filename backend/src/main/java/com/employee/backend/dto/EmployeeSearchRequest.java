package com.employee.backend.dto;

import lombok.Data;

@Data
public class EmployeeSearchRequest {

    private String name;
    private String email;
    private String department;

    private int page = 0;
    private int size = 5;

    private String sortBy = "id";
    private String sortDir = "desc";
}