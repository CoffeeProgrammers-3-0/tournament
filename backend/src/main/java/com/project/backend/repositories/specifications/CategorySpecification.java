package com.project.backend.repositories.specifications;

import com.project.backend.models.Category;
import com.project.backend.models.Round;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class CategorySpecification {

    public static Specification<Category> byId(Long id) {
        log.debug("CategorySpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<Category> byTitle(String title) {
        log.debug("CategorySpecification.byTitle called with title={}", title);
        if (title == null || title.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Category> lessThanOrEqualWeight(Double weight) {
        log.debug("CategorySpecification.lessThanOrEqualWeight called with weight={}", weight);
        if (weight == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("weight"), weight);
    }

    public static Specification<Category> greaterThanOrEqualWeight(Double weight) {
        log.debug("CategorySpecification.greaterThanOrEqualWeight called with weight={}", weight);
        if (weight == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("weight"), weight);
    }

    public static Specification<Category> byRound(Round round) {
        log.debug("CategorySpecification.byRound called with round={}", round);
        if (round == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round"), round);
    }

    public static Specification<Category> byRoundId(Long roundId) {
        log.debug("CategorySpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round").get("id"), roundId);
    }
}