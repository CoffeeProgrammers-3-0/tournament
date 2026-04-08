package com.project.backend.listeners;

import com.project.backend.dto.event.*;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.repositories.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketListener {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final TeamRepository teamRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamAssignedToRoundEvent(TeamAssignedToRoundEvent event) {
        List<TeamLeaderboardResponse> teamLeaderboardResponses = teamRepository.findLeaderboardForTeams(event.getRoundId(), List.of(event.getTeamId()));
        convertAndSend(
                "/topic/rounds/" + event.getRoundId() + "/leaderboard",
                EventType.TEAM_ASSIGNED_TO_ROUND,
                teamLeaderboardResponses
        );
    }
    
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamUnassignedFromRoundEvent(TeamUnassignedFromRoundEvent event) {
        convertAndSend(
                "/topic/rounds/" + event.getRoundId() + "/leaderboard",
                EventType.TEAM_UNASSIGNED_FROM_ROUND,
                List.of(Map.of("id", event.getTeamId()))
        );
    }
    
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamDeletedEvent(TeamDeletedEvent event) {
        for(Long roundId : event.getRoundsWithATeam()) {
            convertAndSend(
                    "/topic/rounds/" + roundId + "/leaderboard",
                    EventType.TEAM_DELETED,
                    List.of(Map.of("id", event.getTeamId()))
            );
        }
    }
    
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePointsChangedForTeamEvent(PointsChangedForTeamEvent event) {
        List<TeamLeaderboardResponse> teamLeaderboardResponses = teamRepository.findLeaderboardForTeams(event.getRoundId(), List.of(event.getTeamId()));
        convertAndSend(
                "/topic/rounds/" + event.getRoundId() + "/leaderboard",
                EventType.POINTS_CHANGED,
                teamLeaderboardResponses
        );
    }
    
    private void convertAndSend(String topic, EventType eventType, Object content) {
        Map<String, Object> payload = Map.of("type", eventType, "content", content);
        simpMessagingTemplate.convertAndSend(topic, payload);
    }
}
