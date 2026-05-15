package com.project.backend.repositories;

import com.project.backend.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    @Modifying
    @Query("UPDATE Notification n SET n.seen = true WHERE n.id IN :ids")
    void markAsSeenByIds(@Param("ids") List<Long> ids);

    @Query("""
                SELECT n.receiver.id, COUNT(n)
                FROM Notification n
                WHERE n.receiver.id IN :userIds
                  AND n.seen = false
                GROUP BY n.receiver.id
            """)
    List<Object[]> countUnseenByUserIdsRaw(@Param("userIds") Set<Long> userIds);

    default Map<Long, Long> countUnseenByUserIds(Set<Long> userIds) {
        return countUnseenByUserIdsRaw(userIds).stream()
                .collect(Collectors.toMap(
                        r -> (Long) r[0],
                        r -> (Long) r[1]
                ));
    }
}
