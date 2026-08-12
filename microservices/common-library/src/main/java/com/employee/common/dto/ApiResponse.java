package com.employee.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private String message;
    private T data;
    @Builder.Default
    private String timeStamp = LocalDateTime.now().toString();

    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
        this.timeStamp = LocalDateTime.now().toString();
    }
}
