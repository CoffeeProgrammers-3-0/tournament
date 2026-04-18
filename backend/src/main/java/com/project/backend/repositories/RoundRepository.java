package com.project.backend.repositories;

import com.project.backend.models.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RoundRepository extends JpaRepository<Round, Long>, JpaSpecificationExecutor<Round> {
    @Modifying
    @Query(value = """
            UPDATE tournament.rounds r
            SET status = 1
            WHERE r.status = 0
              AND r.start_date <= :now
            RETURNING r.id
            """, nativeQuery = true)
    List<Long> startRoundsAndReturnIds(@Param("now") Instant now);

    @Modifying
    @Query(value = """
            UPDATE tournament.rounds r
            SET status = 2
            WHERE r.status = 1
              AND r.end_date <= :now
            RETURNING r.id
            """, nativeQuery = true)
    List<Long> closeRoundSubmissionsAndReturnIds(@Param("now") Instant now);

    @Query("""
            SELECT r.id
            FROM Round r
            WHERE r.status = com.project.backend.models.constants.RoundStatus.ACTIVE
              AND r.endDate >= :from
              AND r.endDate < :to
        """)
    List<Long> findRoundsWithDeadlineBetween(
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    Optional<Round> findFirstByTournamentIdOrderByStartDateAsc(Long tournamentId);
}