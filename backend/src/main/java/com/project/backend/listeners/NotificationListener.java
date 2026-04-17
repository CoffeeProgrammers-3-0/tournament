package com.project.backend.listeners;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.project.backend.dto.event.NewNotificationsEvent;
import com.project.backend.dto.event.RoundCreatedEvent;
import com.project.backend.models.Notification;
import com.project.backend.models.Round;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.NotificationKey;
import com.project.backend.repositories.NotificationRepository;
import com.project.backend.repositories.UserRepository;
import com.project.backend.repositories.specifications.UserSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundCreatedEvent(RoundCreatedEvent event) {
        Round round = event.getRound();
        Tournament tournament = round.getTournament();

        List<User> users = userRepository.findAll(UserSpecification.byTournamentId(tournament.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_CREATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    private static List<Notification> createNotifications(List<User> users, NotificationKey key, JsonNode payload) {
        List<Notification> notifications = new ArrayList<>();
        Notification temp;
        for(User user : users) {
            temp = new Notification();
            temp.setReceiver(user);
            temp.setDate(LocalDateTime.now());
            temp.setKey(key);
            temp.setPayload(payload);
            notifications.add(temp);
        }
        return notifications;
    }
}
