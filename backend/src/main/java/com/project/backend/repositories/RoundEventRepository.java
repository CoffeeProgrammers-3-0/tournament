package com.project.backend.repositories;

import com.project.backend.models.RoundEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface RoundEventRepository extends JpaRepository<RoundEvent, Long>, JpaSpecificationExecutor<RoundEvent> {
    @Query("SELECT e.id FROM RoundEvent e WHERE e.startDate >= :from AND e.startDate < :to")
    List<Long> findEventsWithStartDateBetween(
            @Param("from") Instant from,
            @Param("to") Instant to
    );
}
