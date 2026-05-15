package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.TeamTask;
import com.project.backend.models.User;
import com.project.backend.models.constants.*;
import com.project.backend.models.join_tables.TeamParticipant;
import jakarta.persistence.criteria.Join;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class TeamTaskSpecification {

    public static Specification<TeamTask> byTeamId(Long teamId) {
        log.debug("TeamTaskSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("team").get("id"), teamId);
    }

    public static Specification<TeamTask> byTeam(Team team) {
        log.debug("TeamTaskSpecification.byTeam called with team={}", team);
        if (team == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("team"), team);
    }

    public static Specification<TeamTask> byRoundId(Long roundId) {
        log.debug("TeamTaskSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round").get("id"), roundId);
    }

    public static Specification<TeamTask> byRound(Round round) {
        log.debug("TeamTaskSpecification.byRound called with round={}", round);
        if (round == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round"), round);
    }

    public static Specification<TeamTask> byCreatorId(Long creatorId) {
        log.debug("TeamTaskSpecification.byCreatorId called with creatorId={}", creatorId);
        if (creatorId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("creator").get("id"), creatorId);
    }

    public static Specification<TeamTask> byCreator(User creator) {
        log.debug("TeamTaskSpecification.byCreator called with creator={}", creator);
        if (creator == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("creator"), creator);
    }

    public static Specification<TeamTask> byAssigneeId(Long assigneeId) {
        log.debug("TeamTaskSpecification.byAssigneeId called with assigneeId={}", assigneeId);
        if (assigneeId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("assignee").get("id"), assigneeId);
    }

    public static Specification<TeamTask> byAssignee(User assignee) {
        log.debug("TeamTaskSpecification.byAssignee called with assignee={}", assignee);
        if (assignee == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("assignee"), assignee);
    }

    public static Specification<TeamTask> byStatus(TaskStatus status) {
        log.debug("TeamTaskSpecification.byStatus called with status={}", status);
        if (status == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("status"), status);
    }

    public static Specification<TeamTask> byType(TaskType type) {
        log.debug("TeamTaskSpecification.byType called with type={}", type);
        if (type == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("type"), type);
    }

    public static Specification<TeamTask> byPriority(TaskPriority priority) {
        log.debug("TeamTaskSpecification.byPriority called with priority={}", priority);
        if (priority == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("priority"), priority);
    }

    public static Specification<TeamTask> byTitle(String title) {
        log.debug("TeamTaskSpecification.byTitle called with title={}", title);
        if (title == null || title.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<TeamTask> byUsersTeam(Long userId) {
        log.debug("TeamTaskSpecification.byUsersTeam called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<TeamTask, Team> teamJoin = root.join("team");
            Join<Team, TeamParticipant> tpJoin = teamJoin.join("teamParticipants");

            return cb.equal(tpJoin.get("user").get("id"), userId);
        };
    }

    public static Specification<TeamTask> notDraft() {
        return (root, query, cb) -> cb.and(
                cb.notEqual(root.get("round").get("status"), RoundStatus.DRAFT),
                cb.notEqual(root.get("round").get("tournament").get("status"), TournamentStatus.DRAFT)
        );
    }
}