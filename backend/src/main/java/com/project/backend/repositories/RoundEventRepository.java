package com.project.backend.repositories;

import com.project.backend.dto.calendar.CalendarEventDTO;
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

    @Query("SELECT new com.project.backend.dto.calendar.CalendarEventDTO(" +
           "re.round.id, re.title, re.startDate, re.endDate, " +
           "CASE " +
           "  WHEN re.type = com.project.backend.models.constants.RoundEventType.ONLINE THEN com.project.backend.dto.calendar.CalendarEventType.ROUND_EVENT_ONLINE " +
           "  ELSE com.project.backend.dto.calendar.CalendarEventType.ROUND_EVENT_OFFLINE " +
           "END) " +
           "FROM RoundEvent re " +
           "WHERE re.startDate <= :end AND re.endDate >= :start " +
           "AND (:userId IS NULL OR " +
           "  EXISTS (SELECT 1 FROM Jury j WHERE j.round = re.round AND j.user.id = :userId) OR " +
           "  EXISTS (SELECT 1 FROM TeamRound tr " +
           "          JOIN TeamParticipant tp ON tr.team = tp.team " +
           "          WHERE tr.round = re.round AND tp.user.id = :userId AND tp.tournament = re.round.tournament)) " +
           "AND (" +
           "  (re.type = com.project.backend.models.constants.RoundEventType.ONLINE AND :showOnline = true) " +
           "  OR (re.type = com.project.backend.models.constants.RoundEventType.OFFLINE AND :showOffline = true)" +
           ")")
    List<CalendarEventDTO> findPersonalRoundEventsWithFilters(
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("userId") Long userId,
            @Param("showOffline") boolean showOffline,
            @Param("showOnline") boolean showOnline
    );
}
