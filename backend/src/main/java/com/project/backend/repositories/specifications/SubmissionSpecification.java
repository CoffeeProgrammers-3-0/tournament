package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Submission;
import com.project.backend.models.Team;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

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
}