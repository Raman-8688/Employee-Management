package com.employee.projectknowledge.repository;

import com.employee.projectknowledge.entity.EnterpriseProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnterpriseProjectRepository extends JpaRepository<EnterpriseProject, Long> {
    Optional<EnterpriseProject> findByProjectCode(String projectCode);
    List<EnterpriseProject> findByIndustryDomain(String industryDomain);
    List<EnterpriseProject> findByStatus(String status);

    @Query("SELECT DISTINCT p FROM EnterpriseProject p " +
           "LEFT JOIN p.techStacks t " +
           "LEFT JOIN p.dbSchemas d " +
           "LEFT JOIN p.screens s " +
           "WHERE (:domain IS NULL OR p.industryDomain = :domain) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:query IS NULL OR " +
           "     LOWER(p.projectName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(p.clientName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(t.technologyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(d.tableName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(s.screenName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY p.projectName ASC")
    List<EnterpriseProject> searchProjects(@Param("query") String query, @Param("domain") String domain, @Param("status") String status);
}
