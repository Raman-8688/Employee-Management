package com.employee.taskservice.repository;

import com.employee.taskservice.entity.TaskLearning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLearningRepository extends JpaRepository<TaskLearning, Long> {
    List<TaskLearning> findByTaskId(Long taskId);
    List<TaskLearning> findByEmployeeId(Long employeeId);
    List<TaskLearning> findByCategory(String category);

    @Query("SELECT l FROM TaskLearning l WHERE " +
           "(:category IS NULL OR l.category = :category) AND " +
           "(:query IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.content) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.employeeName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY l.createdAt DESC")
    List<TaskLearning> searchLearnings(@Param("category") String category, @Param("query") String query);
}
