package com.project.backend.models.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationKey {
    ROUND_CREATED("notifications.round.created"),
    JURY_ASSIGNED("notifications.jury_submission.assigned"),
    JURY_UNASSIGNED("notifications.jury_submission.unassigned"),
    POINTS_CHANGED("notifications.points_changed"),
    TEAM_CREATED("notifications.team.created"),
    TEAM_UNASSIGNED_FROM_ROUND("notifications.team.unassigned_from_round"),
    TEAM_ASSIGNED_TO_ROUND("notifications.team.assigned_to_round"),
    TEAM_TASK_CREATED("notifications.team_tasks.created"),
    TEAM_TASK_UPDATED("notifications.team_tasks.updated"),
    TEAM_TASK_DELETED("notifications.team_tasks.deleted"),
    USER_ADDED_TO_TEAM("notifications.team.user_added"),
    USER_REMOVED_FROM_TEAM("notifications.team.user_removed"),
    USER_SET_TO_LEADER("notifications.team.user_set_to_leader"),
    USER_IS_NO_LONGER_LEADER("notifications.team.user_is_no_longer_leader"),
    TOURNAMENT_REGISTRATION_STARTED("notifications.global.tournament.registration_started"),
    TOURNAMENT_STARTED("notifications.tournament.started"),
    ROUND_SUBMISSION_CLOSED("notifications.round.submission_closed"),
    ROUND_STARTED("notifications.round.started"),
    ROUND_DEADLINE_24H("notifications.round.deadline_24h"),
    JURY_UNASSIGNED_FROM_ROUND("notifications.jury.unassigned_from_round"),
    JURY_ASSIGNED_TO_ROUND("notifications.jury.assigned_to_round"),
    ROUND_ADMIN_MESSAGE_CREATED("notifications.round_admin_message.created"),
    ROUND_EVENT_CREATED("notifications.round_event.created"),
    ROUND_EVENT_BEFORE_1H("notifications.round_event.before_1h"),
    ROUND_EVALUATED("notifications.round.evaluated"),
    TOURNAMENT_FINISHED("notifications.tournament.finished");

    private final String i18nKey;
}