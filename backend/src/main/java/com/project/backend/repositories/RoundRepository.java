package com.project.backend.repositories;

import com.project.backend.dto.calendar.CalendarEventDTO;
import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
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

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN TRUE ELSE FALSE END
        FROM Round r
        WHERE r.tournament.id = :tournamentId
        AND r.status IN :statuses
    """)
    boolean existsByTournamentIdAndStatuses(
            @Param("tournamentId") Long tournamentId,
            @Param("statuses") List<RoundStatus> statuses
    );

    @Query("SELECT new com.project.backend.dto.calendar.CalendarEventDTO(" +
           "r.id, r.name, r.startDate, r.endDate, " +
           "com.project.backend.dto.calendar.CalendarEventType.ROUND_ACTIVE) " +
           "FROM Round r " +
           "WHERE r.startDate <= :end AND r.endDate >= :start " +
           "AND r.status = com.project.backend.models.constants.RoundStatus.ACTIVE " +
           "AND (:userId IS NULL OR " +
           "  EXISTS (SELECT 1 FROM Jury j WHERE j.round = r AND j.user.id = :userId) OR " +
           "  EXISTS (SELECT 1 FROM TeamRound tr " +
           "          JOIN TeamParticipant tp ON tr.team = tp.team " +
           "          WHERE tr.round = r AND tp.user.id = :userId AND tp.tournament = r.tournament))")
    List<CalendarEventDTO> findPersonalRoundEvents(
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("userId") Long userId);

    Optional<Round> findFirstByTournamentIdOrderByStartDateAsc(Long tournamentId);
}