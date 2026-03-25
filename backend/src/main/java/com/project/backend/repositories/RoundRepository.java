package com.project.backend.repositories;

import com.project.backend.models.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface RoundRepository extends JpaRepository<Round, Long>, JpaSpecificationExecutor<Round> {
    // Переводимо з DRAFT в ACTIVE, якщо настав час початку раунду
    @Modifying
    @Query("UPDATE Round r SET r.status = com.project.backend.models.constants.RoundStatus.ACTIVE " +
            "WHERE r.status = com.project.backend.models.constants.RoundStatus.DRAFT " +
            "AND r.startDate <= :now")
    int startRounds(@Param("now") LocalDateTime now);

    // Переводимо з ACTIVE в SUBMISSION_CLOSED, якщо час вийшов
    @Modifying
    @Query("UPDATE Round r SET r.status = com.project.backend.models.constants.RoundStatus.SUBMISSION_CLOSED " +
            "WHERE r.status = com.project.backend.models.constants.RoundStatus.ACTIVE " +
            "AND r.endDate <= :now")
    int closeRoundSubmissions(@Param("now") LocalDateTime now);
}