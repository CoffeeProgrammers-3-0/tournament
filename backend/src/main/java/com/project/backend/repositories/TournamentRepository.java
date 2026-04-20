package com.project.backend.repositories;

import com.project.backend.dto.calendar.CalendarEventDTO;
import com.project.backend.models.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long>, JpaSpecificationExecutor<Tournament> {
    @Modifying
    @Query(value = """
        UPDATE tournament.tournaments t
        SET status = 1
        WHERE t.status = 0
          AND t.start_registration <= :now
        RETURNING t.id
        """, nativeQuery = true)
    List<Long> startRegistrationsAndReturnIds(@Param("now") Instant now);

    @Modifying
    @Query(value = """
        UPDATE tournament.tournaments t
        SET status = 2
        WHERE t.status = 1
          AND t.start_tournament <= :now
        RETURNING t.id
        """, nativeQuery = true)
    List<Long> startTournamentsAndReturnIds(@Param("now") Instant now);

    @Modifying
    @Query(value = """
        UPDATE tournament.tournaments t
        SET status = 3
        WHERE t.status = 2
          AND t.count_of_rounds = (
                SELECT COUNT(r.id)
                FROM tournament.rounds r
                WHERE r.tournament_id = t.id
          )
          AND NOT EXISTS (
                SELECT 1
                FROM tournament.rounds r2
                WHERE r2.tournament_id = t.id
                  AND r2.status != 3
          )
        RETURNING t.id
        """, nativeQuery = true)
    List<Long> finishTournamentsAndReturnIds();

    @Query("SELECT new com.project.backend.dto.calendar.CalendarEventDTO(" +
           "t.id, t.name, t.startRegistration, t.endRegistration, " +
           "com.project.backend.dto.calendar.CalendarEventType.TOURNAMENT_REGISTRATION) " +
           "FROM Tournament t " +
           "WHERE t.startRegistration <= :end AND t.endRegistration >= :start " +
           "AND t.status = com.project.backend.models.constants.TournamentStatus.REGISTRATION")
    List<CalendarEventDTO> findRegistrationEvents(@Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT new com.project.backend.dto.calendar.CalendarEventDTO(" +
           "t.id, t.name, t.startTournament, " +
           "(SELECT MAX(r.endDate) FROM Round r WHERE r.tournament = t), " +
           "com.project.backend.dto.calendar.CalendarEventType.TOURNAMENT_RUNNING) " +
           "FROM Tournament t " +
           "WHERE t.startTournament <= :end " +
           "AND (SELECT MAX(r.endDate) FROM Round r WHERE r.tournament = t) >= :start " +
           "AND t.status = com.project.backend.models.constants.TournamentStatus.RUNNING " +
           "AND (:userId IS NULL OR EXISTS (" +
           "  SELECT 1 FROM TeamParticipant tp " +
           "  WHERE tp.tournament = t AND tp.user.id = :userId))")
    List<CalendarEventDTO> findPersonalTournamentEvents(
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("userId") Long userId);
}
