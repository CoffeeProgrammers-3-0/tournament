package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Submission;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.TeamParticipant;
import jakarta.persistence.criteria.Join;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;

@Slf4j
public class SubmissionSpecification {

    public static Specification<Submission> byId(Long id) {
        log.debug("SubmissionSpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<Submission> byTeamId(Long teamId) {
        log.debug("SubmissionSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("team").get("id"), teamId);
    }

    public static Specification<Submission> byTeam(Team team) {
        log.debug("SubmissionSpecification.byTeam called with team={}", team);
        if (team == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("team"), team);
    }

    public static Specification<Submission> byRoundId(Long roundId) {
        log.debug("SubmissionSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round").get("id"), roundId);
    }

    public static Specification<Submission> byRound(Round round) {
        log.debug("SubmissionSpecification.byRound called with round={}", round);
        if (round == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round"), round);
    }

    public static Specification<Submission> byGithubLink(String githubLink) {
        log.debug("SubmissionSpecification.byGithubLink called with githubLink={}", githubLink);
        if (githubLink == null || githubLink.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("githubLink")), "%" + githubLink.toLowerCase() + "%");
    }

    public static Specification<Submission> byVideoLink(String videoLink) {
        log.debug("SubmissionSpecification.byVideoLink called with videoLink={}", videoLink);
        if (videoLink == null || videoLink.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("videoLink")), "%" + videoLink.toLowerCase() + "%");
    }

    public static Specification<Submission> byDescription(String description) {
        log.debug("SubmissionSpecification.byDescription called with description={}", description);
        if (description == null || description.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%");
    }

    public static Specification<Submission> byUserTeam(Long userId) {
        log.debug("SubmissionSpecification.byUserTeam called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<Submission, Team> teamJoin = root.join("team");
            Join<Team, TeamParticipant> tpJoin = teamJoin.join("teamParticipants");
            Join<TeamParticipant, User> userJoin = tpJoin.join("user");

            return cb.equal(userJoin.get("id"), userId);
        };
    }

    public static Specification<Submission> byJuryId(Long juryId) {
        log.debug("SubmissionSpecification.byJuryId called with juryId={}", juryId);
        if (juryId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<Submission, JurySubmission> jurySubmissionJoin = root.join("jurySubmissions");
            Join<JurySubmission, User> userJoin = jurySubmissionJoin.join("jury");

            return cb.equal(userJoin.get("id"), juryId);
        };
    }


    public static Specification<Submission> byTeamIds(Collection<Long> teamIds) {
        log.debug("SubmissionSpecification.byTeamIds called with teamIds={}", teamIds);

        return (root, query, criteriaBuilder) -> {
            if (teamIds == null || teamIds.isEmpty()) {
                return criteriaBuilder.disjunction();
            }

            return root.get("team").get("id").in(teamIds);
        };
    }
}