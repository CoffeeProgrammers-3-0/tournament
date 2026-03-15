package com.project.backend.repositories.specifications;

import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.TeamParticipant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class TeamParticipantSpecification {

    public static Specification<TeamParticipant> byTeamId(Long teamId) {
        log.debug("TeamParticipantSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("teamId"), teamId);
    }

    public static Specification<TeamParticipant> byUserId(Long userId) {
        log.debug("TeamParticipantSpecification.byUserId called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("userId"), userId);
    }

    public static Specification<TeamParticipant> byTournamentId(Long tournamentId) {
        log.debug("TeamParticipantSpecification.byTournamentId called with tournamentId={}", tournamentId);
        if (tournamentId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("tournamentId"), tournamentId);
    }

    public static Specification<TeamParticipant> byTeam(Team team) {
        log.debug("TeamParticipantSpecification.byTeam called with team={}", team);
        if (team == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("team"), team);
    }

    public static Specification<TeamParticipant> byUser(User user) {
        log.debug("TeamParticipantSpecification.byUser called with user={}", user);
        if (user == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("user"), user);
    }

    public static Specification<TeamParticipant> byTournament(Tournament tournament) {
        log.debug("TeamParticipantSpecification.byTournament called with tournament={}", tournament);
        if (tournament == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("tournament"), tournament);
    }

    public static Specification<TeamParticipant> isLeader(Boolean leader) {
        log.debug("TeamParticipantSpecification.isLeader called with leader={}", leader);
        if (leader == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("isLeader"), leader);
    }

    public static Specification<TeamParticipant> byUserEmail(String email) {
        log.debug("TeamParticipantSpecification.byUserEmail called with email={}", email);
        if (email == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("user").get("email"), email);
    }
}