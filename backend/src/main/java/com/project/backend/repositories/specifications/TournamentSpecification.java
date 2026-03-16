package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.models.join_tables.TeamParticipant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

@Slf4j
public class TournamentSpecification {
    public static Specification<Tournament> byId(Long id) {
        log.debug("TournamentSpecification.byId called with id={}", id);
        if(id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<Tournament> byName(String name) {
        log.debug("TournamentSpecification.byName called with name={}", name);
        if(name == null || name.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Tournament> byDescription(String description) {
        log.debug("TournamentSpecification.byDescription called with description={}", description);
        if(description == null || description.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%");
    }

    public static Specification<Tournament> byTournamentStatus(TournamentStatus status) {
        log.debug("TournamentSpecification.byTournamentStatus called with status={}", status);
        if(status == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("status"), status);
    }

    public static Specification<Tournament> beforeStartTournament(LocalDateTime date) {
        log.debug("TournamentSpecification.beforeStartTournament called with date={}", date);
        if(date == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("startTournament"), date);
    }

    public static Specification<Tournament> afterStartTournament(LocalDateTime date) {
        log.debug("TournamentSpecification.afterStartTournament called with date={}", date);
        if(date == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("startTournament"), date);
    }

    public static Specification<Tournament> betweenStartTournament(LocalDateTime start, LocalDateTime end) {
        log.debug("TournamentSpecification.betweenStartTournament called with start={}, end={}", start, end);
        if(start == null && end == null) return null;
        if(start == null) return beforeStartTournament(end);
        if(end == null) return  afterStartTournament(start);

        return (root, query, cb) ->
                cb.between(root.get("startTournament"), start, end);
    }

    public static Specification<Tournament> beforeEndTournament(LocalDateTime date) {
        log.debug("TournamentSpecification.beforeEndTournament called with date={}", date);
        if (date == null) return null;

        return (root, query, cb) -> {

            Subquery<LocalDateTime> subquery = query.subquery(LocalDateTime.class);
            Root<Round> roundRoot = subquery.from(Round.class);

            subquery.select(cb.greatest(roundRoot.<LocalDateTime>get("endDate")))
                    .where(cb.equal(roundRoot.get("tournament"), root));

            return cb.lessThanOrEqualTo(subquery, date);
        };
    }

    public static Specification<Tournament> afterEndTournament(LocalDateTime date) {
        log.debug("TournamentSpecification.afterEndTournament called with date={}", date);
        if (date == null) return null;

        return (root, query, cb) -> {

            Subquery<LocalDateTime> subquery = query.subquery(LocalDateTime.class);
            Root<Round> roundRoot = subquery.from(Round.class);

            subquery.select(cb.greatest(roundRoot.<LocalDateTime>get("endDate")))
                    .where(cb.equal(roundRoot.get("tournament"), root));

            return cb.greaterThanOrEqualTo(subquery, date);
        };
    }

    public static Specification<Tournament> betweenEndTournament(LocalDateTime start, LocalDateTime end) {
        log.debug("TournamentSpecification.betweenEndTournament called with start={}, end={}", start, end);

        if (start == null && end == null) return null;
        if (start == null) return beforeEndTournament(end);
        if (end == null) return afterEndTournament(start);

        return (root, query, cb) -> {

            Subquery<LocalDateTime> subquery = query.subquery(LocalDateTime.class);
            Root<Round> roundRoot = subquery.from(Round.class);

            subquery.select(cb.greatest(roundRoot.<LocalDateTime>get("endDate")))
                    .where(cb.equal(roundRoot.get("tournament"), root));

            return cb.between(subquery, start, end);
        };
    }

    public static Specification<Tournament> beforeStartRegistration(LocalDateTime date) {
        log.debug("TournamentSpecification.beforeStartRegistration called with date={}", date);
        if(date == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("startRegistration"), date);
    }

    public static Specification<Tournament> afterStartRegistration(LocalDateTime date) {
        log.debug("TournamentSpecification.afterStartRegistration called with date={}", date);
        if(date == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("startRegistration"), date);
    }

    public static Specification<Tournament> betweenStartRegistration(LocalDateTime start, LocalDateTime end) {
        log.debug("TournamentSpecification.betweenStartRegistration called with start={}, end={}", start, end);
        if(start == null && end == null) return null;
        if(start == null) return beforeStartRegistration(end);
        if(end == null) return  afterStartRegistration(start);

        return (root, query, cb) ->
                cb.between(root.get("startRegistration"), start, end);
    }

    public static Specification<Tournament> beforeEndRegistration(LocalDateTime date) {
        log.debug("TournamentSpecification.beforeEndRegistration called with date={}", date);
        if(date == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("endRegistration"), date);
    }

    public static Specification<Tournament> afterEndRegistration(LocalDateTime date) {
        log.debug("TournamentSpecification.afterEndRegistration called with date={}", date);
        if(date == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("endRegistration"), date);
    }

    public static Specification<Tournament> betweenEndRegistration(LocalDateTime start, LocalDateTime end) {
        log.debug("TournamentSpecification.betweenEndRegistration called with start={}, end={}", start, end);
        if(start == null && end == null) return null;
        if(start == null) return beforeEndRegistration(end);
        if(end == null) return  afterEndRegistration(start);

        return (root, query, cb) ->
                cb.between(root.get("endRegistration"), start, end);
    }

    public static Specification<Tournament> lessThanOrEqualMaxCountOfTeam(Long maxCountOfTeam) {
        log.debug("TournamentSpecification.lessThanOrEqualMaxCountOfTeam called with maxCountOfTeam={}", maxCountOfTeam);
        if (maxCountOfTeam == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("maxCountOfTeam"), maxCountOfTeam);
    }

    public static Specification<Tournament> greaterThanOrEqualMaxCountOfTeam(Long maxCountOfTeam) {
        log.debug("TournamentSpecification.greaterThanOrEqualMaxCountOfTeam called with maxCountOfTeam={}", maxCountOfTeam);
        if (maxCountOfTeam == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("maxCountOfTeam"), maxCountOfTeam);
    }

    public static Specification<Tournament> lessThanOrEqualCountOfRounds(Long countOfRounds) {
        log.debug("TournamentSpecification.lessThanOrEqualCountOfRounds called with countOfRounds={}", countOfRounds);
        if (countOfRounds == null) return null;

        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("countOfRounds"), countOfRounds);
    }

    public static Specification<Tournament> greaterThanOrEqualCountOfRounds(Long countOfRounds) {
        log.debug("TournamentSpecification.greaterThanOrEqualCountOfRounds called with countOfRounds={}", countOfRounds);
        if (countOfRounds == null) return null;

        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("countOfRounds"), countOfRounds);
    }

    public static Specification<Tournament> byUserId(Long userId) {
        log.debug("TournamentSpecification.byUserId called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);
            Join<Tournament, TeamParticipant> participantsJoin = root.join("teamParticipants");
            return cb.equal(participantsJoin.get("user").get("id"), userId);
        };
    }

    public static Specification<Tournament> byRoundId(Long roundId) {
        log.debug("TournamentSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);
            Join<Tournament, Round> roundsJoin = root.join("rounds");
            return cb.equal(roundsJoin.get("id"), roundId);
        };
    }

    public static Specification<Tournament> byTeamId(Long teamId) {
        log.debug("TournamentSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<Tournament, TeamParticipant> tpJoin = root.join("teamParticipants");
            Join<TeamParticipant, Team> teamJoin = tpJoin.join("team");
            return cb.equal(teamJoin.get("id"), teamId);
        };
    }
}
