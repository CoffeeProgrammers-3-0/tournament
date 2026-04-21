package com.project.backend.listeners;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.project.backend.dto.event.*;
import com.project.backend.models.*;
import com.project.backend.models.adminMessages.GlobalAdminMessage;
import com.project.backend.models.adminMessages.RoundAdminMessage;
import com.project.backend.models.constants.NotificationKey;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.UserSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TournamentRepository tournamentRepository;
    private final GlobalAdminMessageRepository globalAdminMessageRepository;
    private final RoundEventRepository roundEventRepository;
    private final ObjectMapper objectMapper;

    private final ApplicationEventPublisher eventPublisher;

//    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
//    public void handleRoundCreatedEvent(RoundCreatedEvent event) {
//        Round round = event.getRound();
//        Tournament tournament = round.getTournament();
//
//        List<User> users = userRepository.findAll(UserSpecification.byTournamentId(tournament.getId()));
//
//        ObjectNode payload = objectMapper.createObjectNode();
//        payload.put("roundId", round.getId());
//        payload.put("roundName", round.getName());
//        payload.put("tournamentId", tournament.getId());
//        payload.put("tournamentName", tournament.getName());
//
//        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_CREATED, payload);
//        notifications = notificationRepository.saveAll(notifications);
//
//        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
//        eventPublisher.publishEvent(event1);
//    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleJurySubmissionCreatedEvent(JurySubmissionCreatedEvent event) {
        JurySubmission js = event.getJurySubmission();
        Submission submission = js.getSubmission();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("submissionId", submission.getId());
        payload.put("teamName", submission.getTeam().getName());
        payload.put("roundName", submission.getRound().getName());
        payload.put("roundId", submission.getRound().getId());

        List<Notification> notifications = createNotifications(List.of(js.getJury()), NotificationKey.JURY_ASSIGNED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePointsChangedForTeamEvent(PointsChangedForTeamEvent event) {
        List<User> users = userRepository.findAll(Specification.allOf(UserSpecification.byTeamId(event.getTeamId()), UserSpecification.byRoundId(event.getRoundId())));
        Round round = roundRepository.findById(event.getRoundId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getRoundId() + " not found"));
        Team team = teamRepository.findById(event.getTeamId()).orElseThrow(() -> new EntityNotFoundException("Team with id " + event.getTeamId() + " not found"));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.POINTS_CHANGED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamCreatedEvent(TeamCreatedEvent event) {
        List<User> users = userRepository.findAll(Specification.allOf(UserSpecification.byTeamId(event.getTeam().getId()), UserSpecification.byTournamentId(event.getTournament().getId())));
        Tournament tournament = event.getTournament();
        Team team = event.getTeam();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TEAM_CREATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamUnassignedFromRoundEvent(TeamUnassignedFromRoundEvent event) {
        Round round = roundRepository.findById(event.getRoundId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getRoundId() + " not found"));
        Team team = teamRepository.findById(event.getTeamId()).orElseThrow(() -> new EntityNotFoundException("Team with id " + event.getTeamId() + " not found"));
        List<User> users = userRepository.findAll(Specification.allOf(UserSpecification.byTeamId(event.getTeamId()), UserSpecification.byTournamentId(round.getTournament().getId())));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TEAM_ASSIGNED_TO_ROUND, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamAssignedToRoundEvent(TeamAssignedToRoundEvent event) {
        Round round = roundRepository.findById(event.getRoundId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getRoundId() + " not found"));
        Team team = teamRepository.findById(event.getTeamId()).orElseThrow(() -> new EntityNotFoundException("Team with id " + event.getTeamId() + " not found"));
        List<User> users = userRepository.findAll(Specification.allOf(UserSpecification.byTeamId(event.getTeamId()), UserSpecification.byRoundId(round.getId())));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TEAM_UNASSIGNED_FROM_ROUND, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleJurySubmissionDeletedEvent(JurySubmissionDeletedEvent event) {
        Submission submission = event.getSubmission();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("submissionId", submission.getId());
        payload.put("teamName", submission.getTeam().getName());
        payload.put("roundName", submission.getRound().getName());
        payload.put("roundId", submission.getRound().getId());

        List<Notification> notifications = createNotifications(List.of(event.getJury()), NotificationKey.JURY_UNASSIGNED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamTaskCreatedEvent(TeamTaskCreatedEvent event) {
        TeamTask teamTask = event.getTeamTask();
        Team team = teamTask.getTeam();
        Round round = teamTask.getRound();
        List<User> users = userRepository.findAll(Specification.allOf(UserSpecification.byTeamId(team.getId()), UserSpecification.byRoundId(round.getId())));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("taskId", team.getId());
        payload.put("taskTitle", teamTask.getTitle());
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TEAM_TASK_CREATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamTaskUpdatedEvent(TeamTaskUpdatedEvent event) {
        TeamTask teamTask = event.getTeamTask();
        Team team = teamTask.getTeam();
        Round round = teamTask.getRound();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("taskId", team.getId());
        payload.put("taskTitle", teamTask.getTitle());
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(List.of(teamTask.getAssignee()), NotificationKey.TEAM_TASK_UPDATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTeamTaskDeletedEvent(TeamTaskDeletedEvent event) {
        Team team = event.getTeam();
        Round round = event.getRound();
        List<User> users = userRepository.findAll(Specification.allOf(UserSpecification.byTeamId(team.getId()), UserSpecification.byRoundId(round.getId())));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("taskTitle", event.getTitle());
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TEAM_TASK_DELETED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserAddedToTeamEvent(UserAddedToTeamEvent event) {
        TeamParticipant tp  = event.getTeamParticipant();
        Team team = tp.getTeam();
        Tournament tournament = tp.getTournament();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(List.of(tp.getUser()), NotificationKey.USER_ADDED_TO_TEAM, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserRemovedFromTeamEvent(UserRemovedFromTeamEvent event) {
        Team team = event.getTeam();
        Tournament tournament = event.getTournament();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(List.of(event.getUser()), NotificationKey.USER_REMOVED_FROM_TEAM, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserSetToLeaderEvent(UserSetToLeaderEvent event) {
        TeamParticipant teamParticipant = event.getTeamParticipant();
        Team team = teamParticipant.getTeam();
        Tournament tournament = teamParticipant.getTournament();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(List.of(teamParticipant.getUser()), NotificationKey.USER_SET_TO_LEADER, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserIsNoLongerLeaderEvent(UserIsNoLongerLeaderEvent event) {
        TeamParticipant teamParticipant = event.getTeamParticipant();
        Team team = teamParticipant.getTeam();
        Tournament tournament = teamParticipant.getTournament();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("teamId", team.getId());
        payload.put("teamName", team.getName());
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(List.of(teamParticipant.getUser()), NotificationKey.USER_IS_NO_LONGER_LEADER, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleJuryAssignedToRoundEvent(JuryAssignedToRoundEvent event) {
        Jury jury = event.getJury();
        Round round = jury.getRound();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(List.of(jury.getUser()), NotificationKey.JURY_ASSIGNED_TO_ROUND, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleJuryUnassignedFromRoundEvent(JuryUnassignedFromRoundEvent event) {
        User user = event.getUser();
        Round round = event.getRound();

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(List.of(user), NotificationKey.JURY_UNASSIGNED_FROM_ROUND, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundDeadline24hEvent(RoundDeadline24hEvent event) {
        Round round = roundRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getId() + " not found"));
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_DEADLINE_24H, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundStartedEvent(RoundStartedEvent event) {
        Round round = roundRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getId() + " not found"));
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_STARTED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundSubmissionClosedEvent(RoundSubmissionClosedEvent event) {
        Round round = roundRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getId() + " not found"));
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_SUBMISSION_CLOSED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundEvaluatedEvent(RoundEvaluatedEvent event) {
        Round round = roundRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Round with id " + event.getId() + " not found"));
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_EVALUATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTournamentFinishedEvent(TournamentFinishedEvent event) {
        Tournament tournament = tournamentRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + event.getId() + " not found"));
        List<User> users = userRepository.findAll(UserSpecification.byTournamentId(tournament.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TOURNAMENT_FINISHED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTournamentStartedEvent(TournamentStartedEvent event) {
        Tournament tournament = tournamentRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + event.getId() + " not found"));
        List<User> users = userRepository.findAll(UserSpecification.byTournamentId(tournament.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("tournamentId", tournament.getId());
        payload.put("tournamentName", tournament.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.TOURNAMENT_STARTED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTournamentRegistrationStartedEvent(TournamentRegistrationStartedEvent event) {
        Tournament tournament = tournamentRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + event.getId() + " not found"));

        GlobalAdminMessage globalAdminMessage = new GlobalAdminMessage();
        globalAdminMessage.setDate(Instant.now());
        globalAdminMessage.setContent(tournament.getName() + " : " + tournament.getId() + " : " + NotificationKey.TOURNAMENT_REGISTRATION_STARTED.getI18nKey());
        globalAdminMessage.setSystem(true);
        globalAdminMessage = globalAdminMessageRepository.save(globalAdminMessage);

        GlobalAdminMessageCreatedEvent event1 = new GlobalAdminMessageCreatedEvent(globalAdminMessage);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundAdminMessageCreatedEvent(RoundAdminMessageCreatedEvent event) {
        RoundAdminMessage roundAdminMessage = event.getRoundAdminMessage();
        Round round = roundAdminMessage.getRound();
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_ADMIN_MESSAGE_CREATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundEventCreatedEvent(RoundEventCreatedEvent event) {
        RoundEvent roundEvent = event.getRoundEvent();
        Round round = roundEvent.getRound();
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());
        payload.put("eventName", roundEvent.getTitle());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_EVENT_CREATED, payload);
        notifications = notificationRepository.saveAll(notifications);

        NewNotificationsEvent event1 = new NewNotificationsEvent(notifications);
        eventPublisher.publishEvent(event1);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundEventBefore1hEvent(RoundEventBefore1hEvent event) {
        RoundEvent roundEvent = roundEventRepository.findById(event.getId()).orElseThrow(() -> new EntityNotFoundException("Round event with id " + event.getId() + " not found"));
        Round round = roundEvent.getRound();
        List<User> users = userRepository.findAll(UserSpecification.byRoundId(round.getId()));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("roundId", round.getId());
        payload.put("roundName", round.getName());
        payload.put("eventName", roundEvent.getTitle());

        List<Notification> notifications = createNotifications(users, NotificationKey.ROUND_EVENT_BEFORE_1H, payload);
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
            temp.setDate(Instant.now());
            temp.setKey(key);
            temp.setPayload(payload);
            notifications.add(temp);
        }
        return notifications;
    }
}
