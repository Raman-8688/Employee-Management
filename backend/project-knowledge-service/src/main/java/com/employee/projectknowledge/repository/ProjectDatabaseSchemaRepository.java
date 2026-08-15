package com.employee.projectknowledge.repository;

import com.employee.projectknowledge.entity.ProjectDatabaseSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDatabaseSchemaRepository extends JpaRepository<ProjectDatabaseSchema, Long> {
    List<ProjectDatabaseSchema> findByProjectId(Long projectId);
}
