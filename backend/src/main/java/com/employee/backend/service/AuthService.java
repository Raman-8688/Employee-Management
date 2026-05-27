package com.employee.backend.service;



import com.employee.backend.dto.*;
import com.employee.backend.entity.ERole;
import com.employee.backend.entity.Role;
import com.employee.backend.entity.User;
import com.employee.backend.reopository.RoleRepository;
import com.employee.backend.reopository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    // Remove RefreshTokenService - comment it out
    // private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setActive(true);
        user.setEmailVerified(false);

        // Assign default role (USER)
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Generate ONLY access token (no refresh token)
        String accessToken = jwtService.generateToken(savedUser);

        return buildAuthResponse(savedUser, accessToken);
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();

        // Update last login
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());

        // Generate ONLY access token (no refresh token)
        String accessToken = jwtService.generateToken(user);

        return buildAuthResponse(user, accessToken);
    }

    // Remove or comment out the refreshToken method
    /*
    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        // This method is no longer needed
        throw new UnsupportedOperationException("Refresh tokens are not supported");
    }
    */

    // Remove or simplify logout
    @Transactional
    public void logout(String token) {
        // Just clear any server-side state if needed
        // For stateless JWT, logout is handled on client side by removing tokens
        // You can add token to blacklist if needed
    }

    private AuthResponse buildAuthResponse(User user, String accessToken) {
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse("ROLE_USER");

        return AuthResponse.builder()
                .accessToken(accessToken)
                // No refresh token
                .tokenType("Bearer")
                .expiresIn(28800000L) // 8 hours (or whatever you prefer)
                .userInfo(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(role)
                        .build())
                .build();
    }
}