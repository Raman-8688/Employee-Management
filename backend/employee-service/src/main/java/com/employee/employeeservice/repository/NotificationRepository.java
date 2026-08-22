package com.employee.employeeservice.repository;

import com.employee.employeeservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByCategoryOrderByCreatedAtDesc(String category);
    List<Notification> findByReadFalseOrderByCreatedAtDesc();
}
