package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.models.join_tables.TeamRound;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class UserSpecification {
    public static Specification<User> byId(Long id) {
        log.debug("UserSpecification.byId called with id={}", id);
        if(id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<User> byEmail(String email) {
        log.debug("UserSpecification.byEmail called with email={}", email);
        if(email == null || email.isBlank()) return null;

        return (root, query, cb) ->
                cb.equal(root.get("email"), email);
    }

    public static Specification<User> byKeycloakUserId(String keycloakUserId) {
        log.debug("UserSpecification.byKeycloakUserId called with keycloakUserId={}", keycloakUserId);
        if(keycloakUserId == null || keycloakUserId.isBlank()) return null;

        return (root, query, cb) ->
                cb.equal(root.get("keycloakUserId"), keycloakUserId);
    }

    public static Specification<User> byFullName(String fullName) {
        log.debug("UserSpecification.byFullName called with fullName={}", fullName);
        if(fullName == null || fullName.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("fullName")), "%" + fullName.toLowerCase() + "%");
    }

    public static Specification<User> byRole(Role role) {
        log.debug("UserSpecification.byRole called with role={}", role);
        if(role == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("role"), role);
    }

    public static Specification<User> juriesByRoundId(Long roundId) {
        log.debug("UserSpecification.juriesByRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) -> {
            Join<User, Jury> juryJoin = root.join("juries");

            return cb.equal(juryJoin.get("round").get("id"), roundId);
        };
    }

    public static Specification<User> juriesBySubmissionId(Long submissionId) {
        log.debug("UserSpecification.juriesBySubmissionId called with submissionId={}", submissionId);
        if (submissionId == null) return null;

        return (root, query, cb) -> {
            Join<User, JurySubmission> juryJoin = root.join("jurySubmissions");

            return cb.equal(juryJoin.get("submission").get("id"), submissionId);
        };
    }

    public static Specification<User> juriesAvailableBySubmissionId(Long submissionId) {
        log.debug("UserSpecification.juriesAvailableBySubmissionId called with submissionId={}", submissionId);
        if (submissionId == null) return null;

        return (root, query, cb) -> {

            Subquery<Long> subquery = query.subquery(Long.class);
            Root<JurySubmission> js = subquery.from(JurySubmission.class);

            subquery.select(cb.literal(1L))
                    .where(
                            cb.equal(js.get("jury").get("id"), root.get("id")),
                            cb.equal(js.get("submission").get("id"), submissionId)
                    );

            return cb.not(cb.exists(subquery));
        };
    }

    public static Specification<User> teammatesInRound(Long userId, Long roundId) {
        log.debug("UserSpecification.teammatesInRound called with userId={}, roundId={}", userId, roundId);
        if (userId == null || roundId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<User, TeamParticipant> tp = root.join("teamParticipants");
            Join<TeamParticipant, Team> team = tp.join("team");
            Join<TeamParticipant, Tournament> tournament = tp.join("tournament");

            Join<Tournament, Round> round = tournament.join("rounds");

            Predicate roundCondition = cb.equal(round.get("id"), roundId);

            Subquery<Long> subquery = query.subquery(Long.class);
            Root<TeamParticipant> subTp = subquery.from(TeamParticipant.class);
            Join<TeamParticipant, Tournament> subTournament = subTp.join("tournament");

            subquery.select(subTp.get("team").get("id"))
                    .where(
                            cb.equal(subTp.get("user").get("id"), userId),
                            cb.equal(subTournament.get("id"), tournament.get("id"))
                    );

            Predicate sameTeam = team.get("id").in(subquery);

            return cb.and(roundCondition, sameTeam);
        };
    }

    public static Specification<User> byTournamentId(Long tournamentId) {
        log.debug("UserSpecification.byTournamentId called with tournamentId={}", tournamentId);
        if (tournamentId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<User, TeamParticipant> tp = root.join("teamParticipants");

            return cb.equal(tp.get("tournament").get("id"), tournamentId);
        };
    }

    public static Specification<User> byTeamId(Long teamId) {
        log.debug("UserSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<User, TeamParticipant> tp = root.join("teamParticipants");
            return cb.equal(tp.get("team").get("id"), teamId);
        };
    }

    public static Specification<User> byRoundId(Long roundId) {
        log.debug("UserSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<User, TeamParticipant> tp = root.join("teamParticipants");
            Join<TeamParticipant, Tournament> tournament = tp.join("tournament");
            Join<Tournament, Round> tournamentRound = tournament.join("rounds");

            Join<TeamParticipant, Team> team = tp.join("team");
            Join<Team, TeamRound> teamRound = team.join("teamRounds");
            Join<TeamRound, Round> roundFromTeam = teamRound.join("round");

            return cb.and(
                    cb.equal(tournamentRound.get("id"), roundId),
                    cb.equal(roundFromTeam.get("id"), roundId)
            );
        };
    }
}
