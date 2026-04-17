package com.project.backend.listeners;

import com.project.backend.dto.event.*;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.mappers.NotificationMapper;
import com.project.backend.models.Notification;
import com.project.backend.repositories.NotificationRepository;
import com.project.backend.repositories.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketListener {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final TeamRepository teamRepository;
    private final NotificationMapper notificationMapper;
    private final NotificationRepository notificationRepository;

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
        for (Long roundId : event.getRoundsWithATeam()) {
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

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNewNotificationsEvent(NewNotificationsEvent event) {
        List<Notification> notifications = event.getNotifications();

        Set<Long> userIds = notifications.stream()
                .map(n -> n.getReceiver().getId())
                .collect(Collectors.toSet());

        Map<Long, Long> unseenCounts = notificationRepository.countUnseenByUserIds(userIds);

        for (Notification notification : notifications) {
            Long userId = notification.getReceiver().getId();

            convertAndSendNotification(
                    "/topic/users/" + userId + "/notifications",
                    EventType.NEW_NOTIFICATION,
                    unseenCounts.getOrDefault(userId, 0L),
                    notificationMapper.fromNotificationToResponse(notification)
            );
        }
    }

    private void convertAndSend(String topic, EventType eventType, Object content) {
        Map<String, Object> payload = Map.of("type", eventType, "content", content);
        simpMessagingTemplate.convertAndSend(topic, payload);

        log.info("WebSocket event sent | topic={} | type={} | content={}",
                topic, eventType, content);
    }

    private void convertAndSendNotification(String topic, EventType eventType, Long countUnseen, Object content) {
        Map<String, Object> payload = Map.of("type", eventType, "countUnseen", countUnseen, "content", content);
        simpMessagingTemplate.convertAndSend(topic, payload);

        log.info("WebSocket notification sent | topic={} | type={} | countUnseen={} | content={}",
                topic, eventType, countUnseen, content);
    }
}
