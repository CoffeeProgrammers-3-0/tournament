package com.project.backend.repositories.specifications;

import com.project.backend.models.Submission;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmission;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class JurySubmissionSpecification {

    public static Specification<JurySubmission> byId(Long id) {
        log.debug("JurySubmissionSpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<JurySubmission> bySubmissionId(Long submissionId) {
        log.debug("JurySubmissionSpecification.bySubmissionId called with submissionId={}", submissionId);
        if (submissionId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("submission").get("id"), submissionId);
    }

    public static Specification<JurySubmission> byJuryId(Long juryId) {
        log.debug("JurySubmissionSpecification.byJuryId called with juryId={}", juryId);
        if (juryId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("jury").get("id"), juryId);
    }

    public static Specification<JurySubmission> bySubmission(Submission submission) {
        log.debug("JurySubmissionSpecification.bySubmission called with submission={}", submission);
        if (submission == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("submission"), submission);
    }

    public static Specification<JurySubmission> byJury(User jury) {
        log.debug("JurySubmissionSpecification.byJury called with jury={}", jury);
        if (jury == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("jury"), jury);
    }

    public static Specification<JurySubmission> bySubmissionIdAndJuryId(Long submissionId, Long juryId) {
        return bySubmissionId(submissionId).and(byJuryId(juryId));
    }

    public static Specification<JurySubmission> byRoundId(Long roundId) {
        log.debug("JurySubmissionSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("submission").get("round").get("id"), roundId);
    }

    public static Specification<JurySubmission> byTeamId(Long teamId) {
        log.debug("JurySubmissionSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("submission").get("team").get("id"), teamId);
    }
}