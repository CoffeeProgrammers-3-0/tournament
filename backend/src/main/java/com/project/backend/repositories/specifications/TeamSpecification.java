package com.project.backend.repositories.specifications;

import com.project.backend.models.Team;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.models.join_tables.TeamRound;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class TeamSpecification {

    public static Specification<Team> byId(Long id) {
        log.debug("TeamSpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<Team> byName(String name) {
        log.debug("TeamSpecification.byName called with name={}", name);
        if (name == null || name.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Team> byEmail(String email) {
        log.debug("TeamSpecification.byEmail called with email={}", email);
        if (email == null || email.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%");
    }

    public static Specification<Team> byOrganization(String organization) {
        log.debug("TeamSpecification.byOrganization called with organization={}", organization);
        if (organization == null || organization.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("organization")), "%" + organization.toLowerCase() + "%");
    }

    public static Specification<Team> byContact(String contact) {
        log.debug("TeamSpecification.byContact called with contact={}", contact);
        if (contact == null || contact.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("contact")), "%" + contact.toLowerCase() + "%");
    }

    public static Specification<Team> byUserId(Long userId) {
        log.debug("TeamSpecification.byUserId called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<Team, TeamParticipant> tpJoin = root.join("teamParticipants");
            return cb.equal(tpJoin.get("user").get("id"), userId);
        };
    }

    public static Specification<Team> byTournamentId(Long tournamentId) {
        log.debug("TeamSpecification.byTournamentId called with tournamentId={}", tournamentId);
        if (tournamentId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            Join<Team, TeamParticipant> tpJoin = root.join("teamParticipants");
            return cb.equal(tpJoin.get("tournament").get("id"), tournamentId);
        };
    }

    public static Specification<Team> byRoundId(Long roundId) {
        log.debug("TeamSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);
            Join<Team, TeamRound> trJoin = root.join("teamRounds");
            return cb.equal(trJoin.get("round").get("id"), roundId);
        };
    }
    public static Specification<Team> byRoundIdNot(Long roundId) {
        log.debug("TeamSpecification.byRoundIdNot called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) -> {
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<TeamRound> tr = subquery.from(TeamRound.class);

            subquery.select(cb.literal(1L))
                    .where(
                            cb.equal(tr.get("team").get("id"), root.get("id")),
                            cb.equal(tr.get("round").get("id"), roundId)
                    );

            return cb.not(cb.exists(subquery));
        };
    }
}