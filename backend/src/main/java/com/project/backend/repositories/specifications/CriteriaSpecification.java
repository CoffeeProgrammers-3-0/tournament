package com.project.backend.repositories.specifications;

import com.project.backend.models.Category;
import com.project.backend.models.Criteria;
import com.project.backend.models.Round;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class CriteriaSpecification {

    public static Specification<Criteria> byId(Long id) {
        log.debug("CriteriaSpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<Criteria> byText(String text) {
        log.debug("CriteriaSpecification.byText called with text={}", text);
        if (text == null || text.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("text")), "%" + text.toLowerCase() + "%");
    }

    public static Specification<Criteria> byCategory(Category category) {
        log.debug("CriteriaSpecification.byCategory called with category={}", category);
        if (category == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("category"), category);
    }

    public static Specification<Criteria> byCategoryId(Long categoryId) {
        log.debug("CriteriaSpecification.byCategoryId called with categoryId={}", categoryId);
        if (categoryId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Criteria> byRound(Round round) {
        log.debug("CriteriaSpecification.byRound called with round={}", round);
        if (round == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("category").get("round"), round);
    }

    public static Specification<Criteria> byRoundId(Long roundId) {
        log.debug("CriteriaSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("category").get("round").get("id"), roundId);
    }
}