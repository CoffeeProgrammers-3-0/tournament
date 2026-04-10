package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.RoundEvent;
import com.project.backend.models.constants.RoundEventType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class RoundEventSpecification {

    public static Specification<RoundEvent> byRoundId(Long roundId) {
        log.debug("RoundEventSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("round").get("id"), roundId);
    }

    public static Specification<RoundEvent> byRound(Round round) {
        log.debug("RoundEventSpecification.byRound called with round={}", round);
        if (round == null) return null;
        return (root, query, cb) -> cb.equal(root.get("round"), round);
    }

    public static Specification<RoundEvent> byType(RoundEventType type) {
        log.debug("RoundEventSpecification.byType called with type={}", type);
        if (type == null) return null;
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<RoundEvent> byTitle(String title) {
        log.debug("RoundEventSpecification.byTitle called with title={}", title);
        if (title == null || title.isBlank()) return null;
        return (root, query, cb) -> 
                cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<RoundEvent> byLocation(String location) {
        log.debug("RoundEventSpecification.byLocation called with location={}", location);
        if (location == null || location.isBlank()) return null;
        return (root, query, cb) -> 
                cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }

    public static Specification<RoundEvent> byId(Long roundEventId) {
        log.debug("RoundEventSpecification.byId called with roundEventId={}", roundEventId);
        if (roundEventId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("id"), roundEventId);
    }

    public static Specification<RoundEvent> byCreatorId(Long creatorId) {
        log.debug("RoundEventSpecification.byCreatorId called with creatorId={}", creatorId);
        if (creatorId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("creator").get("id"), creatorId);
    }
}