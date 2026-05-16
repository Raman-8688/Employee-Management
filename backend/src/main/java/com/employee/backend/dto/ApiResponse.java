package com.employee.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class ApiResponse<T> {

    private String message;
    private T data;
    private LocalDateTime timeStamp;

    public ApiResponse(String message,T data){
        this.message=message;
        this.data=data;
        this.timeStamp=LocalDateTime.now();
    }
}
