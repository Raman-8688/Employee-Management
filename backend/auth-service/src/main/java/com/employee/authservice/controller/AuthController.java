package com.employee.authservice.controller;

import com.employee.authservice.service.AuthService;
import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthService.LoginResponse>> login(@RequestBody AuthService.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@RequestBody AuthService.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}
