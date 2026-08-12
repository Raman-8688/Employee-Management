package com.employee.authservice.config;

import com.employee.authservice.entity.Role;
import com.employee.authservice.entity.User;
import com.employee.authservice.repository.RoleRepository;
import com.employee.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed RBAC Roles
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));
        Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_MANAGER").build()));
        Role hrRole = roleRepository.findByName("ROLE_HR")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_HR").build()));
        Role employeeRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_EMPLOYEE").build()));

        // Seed Initial Admin User
        if (!userRepository.existsByUsername("admin")) {
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRole);
            adminRoles.add(managerRole);
            adminRoles.add(hrRole);

            User admin = User.builder()
                    .username("admin")
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .firstName("Enterprise")
                    .lastName("Admin")
                    .roles(adminRoles)
                    .build();

            userRepository.save(admin);
        }
    }
}
