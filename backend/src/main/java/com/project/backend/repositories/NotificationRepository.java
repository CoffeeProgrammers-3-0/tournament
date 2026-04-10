package com.project.backend.repositories;

import com.project.backend.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    @Modifying
    @Query("UPDATE Notification n SET n.seen = true WHERE n.id IN :ids")
    void markAsSeenByIds(@Param("ids") List<Long> ids);
}
