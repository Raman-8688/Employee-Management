package com.employee.backend.config;

import com.employee.backend.entity.ERole;
import com.employee.backend.entity.Role;
import com.employee.backend.entity.User;
import com.employee.backend.reopository.RoleRepository;
import com.employee.backend.reopository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeRoles();
        initializeAdminUser();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            log.info("Initializing roles...");
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            roleRepository.save(new Role(ERole.ROLE_MANAGER));
            roleRepository.save(new Role(ERole.ROLE_USER));
            log.info("Roles initialized successfully");
        }
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            log.info("Creating admin user...");

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@employee.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setActive(true);
            admin.setEmailVerified(true);

            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).get());
            roles.add(roleRepository.findByName(ERole.ROLE_MANAGER).get());
            roles.add(roleRepository.findByName(ERole.ROLE_USER).get());
            admin.setRoles(roles);

            userRepository.save(admin);
            log.info("Admin user created successfully with username: admin and password: Admin@123");
        }
    }
}