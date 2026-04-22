package com.project.backend.repositories.specifications;

import com.project.backend.models.Criteria;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class JurySubmissionCriteriaSpecification {

    public static Specification<JurySubmissionCriteria> byJurySubmissionId(Long jurySubmissionId) {
        log.debug("JurySubmissionCriteriaSpecification.byJurySubmissionId called with jurySubmissionId={}", jurySubmissionId);
        if (jurySubmissionId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("jurySubmissionId"), jurySubmissionId);
    }

    public static Specification<JurySubmissionCriteria> byCriteriaId(Long criteriaId) {
        log.debug("JurySubmissionCriteriaSpecification.byCriteriaId called with criteriaId={}", criteriaId);
        if (criteriaId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("criteriaId"), criteriaId);
    }

    public static Specification<JurySubmissionCriteria> isAdditional(boolean isAdditional) {
        log.debug("JurySubmissionCriteriaSpecification.isAdditional called with isAdditional={}", isAdditional);

        return (root, query, cb) ->
                cb.equal(root.get("isAdditional"), isAdditional);
    }

    public static Specification<JurySubmissionCriteria> byJurySubmission(JurySubmission jurySubmission) {
        log.debug("JurySubmissionCriteriaSpecification.byJurySubmission called with jurySubmission={}", jurySubmission);
        if (jurySubmission == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("jurySubmission"), jurySubmission);
    }

    public static Specification<JurySubmissionCriteria> byCriteria(Criteria criteria) {
        log.debug("JurySubmissionCriteriaSpecification.byCriteria called with criteria={}", criteria);
        if (criteria == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("criteria"), criteria);
    }

    public static Specification<JurySubmissionCriteria> lessThanOrEqualPoints(Long points) {
        log.debug("JurySubmissionCriteriaSpecification.lessThanOrEqualPoints called with points={}", points);
        if (points == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("points"), points);
    }

    public static Specification<JurySubmissionCriteria> greaterThanOrEqualPoints(Long points) {
        log.debug("JurySubmissionCriteriaSpecification.greaterThanOrEqualPoints called with points={}", points);
        if (points == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("points"), points);
    }

    public static Specification<JurySubmissionCriteria> byJurySubmissionIdAndCriteriaId(Long jurySubmissionId, Long criteriaId) {
        return byJurySubmissionId(jurySubmissionId).and(byCriteriaId(criteriaId));
    }
}