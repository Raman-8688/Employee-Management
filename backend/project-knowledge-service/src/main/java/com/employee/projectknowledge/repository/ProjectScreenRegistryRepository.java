package com.employee.projectknowledge.repository;

import com.employee.projectknowledge.entity.ProjectScreenRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectScreenRegistryRepository extends JpaRepository<ProjectScreenRegistry, Long> {
    List<ProjectScreenRegistry> findByProjectId(Long projectId);
}
