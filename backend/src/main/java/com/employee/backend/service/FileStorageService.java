package com.employee.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        // Local directory path where uploaded images will be stored
        this.fileStorageLocation = Paths.get("uploads/profile-images")
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Created upload directory at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create upload directory", ex);
            throw new RuntimeException("Could not create directory for uploaded files.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file. Please select a valid image.");
        }

        String rawFilename = file.getOriginalFilename();
        String originalFilename;
        if (rawFilename == null || rawFilename.trim().isEmpty()) {
            originalFilename = "avatar.png";
        } else {
            originalFilename = StringUtils.cleanPath(rawFilename);
        }

        try {
            // Check for invalid characters
            if (originalFilename.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFilename);
            }

            // Extract file extension
            String extension = ".png";
            int i = originalFilename.lastIndexOf('.');
            if (i >= 0) {
                extension = originalFilename.substring(i);
            }

            // Generate unique file name
            String newFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);

            // Copy file to target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored file successfully: {}", newFileName);

            // Return static URL path
            return "http://localhost:8080/uploads/profile-images/" + newFileName;

        } catch (IOException ex) {
            log.error("Failed to store file {}", originalFilename, ex);
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }
}
