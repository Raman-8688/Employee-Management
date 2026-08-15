package com.employee.projectknowledge.repository;

import com.employee.projectknowledge.entity.ProjectApiEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectApiEndpointRepository extends JpaRepository<ProjectApiEndpoint, Long> {
    List<ProjectApiEndpoint> findByProjectId(Long projectId);
}
