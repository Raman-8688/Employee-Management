package com.employee.notificationservice.repository;

import com.employee.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findTop10ByOrderByCreatedAtDesc();


    Long countByRecipientIdAndReadStatusFalse(Long recipientId);

    Long countByStatus(String status);

    @Query("SELECT n FROM Notification n " +
           "WHERE n.recipientId = :userId " +
           "AND (:category IS NULL OR LOWER(n.category) = LOWER(:category)) " +
           "AND (:unreadOnly IS NULL OR :unreadOnly = FALSE OR n.readStatus = FALSE) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> searchUserNotifications(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("unreadOnly") Boolean unreadOnly
    );

    @Modifying
    @Query("UPDATE Notification n SET n.readStatus = TRUE WHERE n.recipientId = :userId")
    void markAllAsReadForUser(@Param("userId") Long userId);
}
