package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Tournament;
import com.project.backend.models.constants.RoundStatus;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

@Slf4j
public class RoundSpecification {

    public static Specification<Round> byId(Long id) {
        log.debug("RoundSpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<Round> byTournamentId(Long tournamentId) {
        log.debug("RoundSpecification.byTournamentId called with tournamentId={}", tournamentId);
        if (tournamentId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("tournament").get("id"), tournamentId);
    }

    public static Specification<Round> belongingToSameTournamentAs(Long roundId) {
        return (root, query, cb) -> {
            if (roundId == null) return null;

            // 1. Create a subquery to find the Tournament associated with the given roundId
            Subquery<Long> tournamentIdSubquery = query.subquery(Long.class);
            Root<Round> subqueryRoot = tournamentIdSubquery.from(Round.class);

            tournamentIdSubquery.select(subqueryRoot.get("tournament").get("id"))
                    .where(cb.equal(subqueryRoot.get("id"), roundId));

            // 2. Filter the main Round query by that Tournament ID
            return cb.and(
                    cb.equal(root.get("tournament").get("id"), tournamentIdSubquery),
                    cb.notEqual(root.get("id"), roundId) // Виключаємо вхідний раунд
            );
        };
    }

    public static Specification<Round> byTournament(Tournament tournament) {
        log.debug("RoundSpecification.byTournament called with tournament={}", tournament);
        if (tournament == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("tournament"), tournament);
    }

    public static Specification<Round> byName(String name) {
        log.debug("RoundSpecification.byName called with name={}", name);
        if (name == null || name.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Round> byStatus(RoundStatus status) {
        log.debug("RoundSpecification.byStatus called with status={}", status);
        if (status == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("status"), status);
    }

    public static Specification<Round> beforeStartDate(LocalDateTime date) {
        log.debug("RoundSpecification.beforeStartDate called with date={}", date);
        if (date == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("startDate"), date);
    }

    public static Specification<Round> afterStartDate(LocalDateTime date) {
        log.debug("RoundSpecification.afterStartDate called with date={}", date);
        if (date == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("startDate"), date);
    }

    public static Specification<Round> betweenStartDate(LocalDateTime start, LocalDateTime end) {
        log.debug("RoundSpecification.betweenStartDate called with start={}, end={}", start, end);
        if (start == null && end == null) return null;
        if (start == null) return beforeStartDate(end);
        if (end == null) return afterStartDate(start);

        return (root, query, cb) ->
                cb.between(root.get("startDate"), start, end);
    }

    public static Specification<Round> beforeEndDate(LocalDateTime date) {
        log.debug("RoundSpecification.beforeEndDate called with date={}", date);
        if (date == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("endDate"), date);
    }

    public static Specification<Round> afterEndDate(LocalDateTime date) {
        log.debug("RoundSpecification.afterEndDate called with date={}", date);
        if (date == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("endDate"), date);
    }

    public static Specification<Round> betweenEndDate(LocalDateTime start, LocalDateTime end) {
        log.debug("RoundSpecification.betweenEndDate called with start={}, end={}", start, end);
        if (start == null && end == null) return null;
        if (start == null) return beforeEndDate(end);
        if (end == null) return afterEndDate(start);

        return (root, query, cb) ->
                cb.between(root.get("endDate"), start, end);
    }

    public static Specification<Round> lessThanOrEqualCountOfWinners(Long count) {
        log.debug("RoundSpecification.lessThanOrEqualCountOfWinners called with count={}", count);
        if (count == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("countOfWinners"), count);
    }

    public static Specification<Round> greaterThanOrEqualCountOfWinners(Long count) {
        log.debug("RoundSpecification.greaterThanOrEqualCountOfWinners called with count={}", count);
        if (count == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("countOfWinners"), count);
    }
}