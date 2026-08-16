package com.employee.employeeservice.controller;

import com.employee.common.dto.ApiResponse;
import com.employee.common.dto.EmployeeDto;
import com.employee.employeeservice.entity.Employee;
import com.employee.employeeservice.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
@Slf4j
public class EmployeeController {


    private final EmployeeService employeeService;
    private static final String UPLOAD_DIR = "uploads/profile-images/";

    @GetMapping("/findAll")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<List<Employee>> findAllEmployees() {
        return ResponseEntity.ok(employeeService.findAllEmployees());
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Boolean>> verifyEmailExists(@RequestParam("email") String email) {
        boolean exists = employeeService.existsByEmail(email);
        return ResponseEntity.ok(new ApiResponse<>("Email verification result", exists));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeAnalytics() {
        return ResponseEntity.ok(new ApiResponse<>("Employee analytics fetched", employeeService.getEmployeeAnalytics()));
    }


    @GetMapping("/{id}")

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(employeeService.findById(id));
    }

    @GetMapping("/details/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeDetailsById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(new ApiResponse<>("Employee details fetched", employeeService.getEmployeeDtoById(id)));
    }

    @PostMapping("/save")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<Employee> saveEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.saveEmployee(employee));
    }

    @PostMapping(value = "/upload-image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            File uploadFolder = new File(UPLOAD_DIR);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR + newFilename);
            Files.write(filePath, file.getBytes());

            String imageUrl = "http://localhost:8080/uploads/profile-images/" + newFilename;
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("url", imageUrl);

            return ResponseEntity.ok(new ApiResponse<>("Image uploaded successfully", response));
        } catch (IOException e) {
            log.error("Failed to save image upload: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(new ApiResponse<>("Failed to save image", null));
        }
    }


    @PatchMapping("/update")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<Employee> updateEmployeePatch(@RequestBody Employee employee) {
        if (employee.getId() == null) {
            throw new IllegalArgumentException("Employee ID is required for update");
        }
        return ResponseEntity.ok(employeeService.updateEmployee(employee.getId(), employee));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_HR', 'ROLE_EMPLOYEE', 'ROLE_USER')")
    public ResponseEntity<Employee> updateEmployee(@PathVariable("id") Long id, @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }


    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable("id") Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok().build();
    }
}
