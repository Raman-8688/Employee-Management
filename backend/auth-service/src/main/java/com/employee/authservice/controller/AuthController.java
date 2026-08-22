package com.employee.authservice.controller;

import com.employee.authservice.service.AuthService;
import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.MenuAccessDto;
import com.employee.common.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @GetMapping("/menu-access")
    public ResponseEntity<ApiResponse<List<MenuAccessDto>>> getMenuAccess(@RequestParam(value = "roles", required = false) String rolesParam) {
        Set<String> roles = new HashSet<>();
        if (rolesParam != null && !rolesParam.trim().isEmpty()) {
            roles.addAll(Arrays.asList(rolesParam.split(",")));
        } else {
            roles.add("ROLE_ADMIN");
        }

        List<MenuAccessDto> menuAccess = authService.getMenuAccessForRoles(roles);
        return ResponseEntity.ok(new ApiResponse<>("Menu access options resolved", menuAccess));
    }
}
