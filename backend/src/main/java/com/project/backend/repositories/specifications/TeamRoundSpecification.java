package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.join_tables.TeamRound;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class TeamRoundSpecification {

    public static Specification<TeamRound> byTeamId(Long teamId) {
        log.debug("TeamRoundSpecification.byTeamId called with teamId={}", teamId);
        if (teamId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("teamId"), teamId);
    }

    public static Specification<TeamRound> byRoundId(Long roundId) {
        log.debug("TeamRoundSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("roundId"), roundId);
    }

    public static Specification<TeamRound> byTeam(Team team) {
        log.debug("TeamRoundSpecification.byTeam called with team={}", team);
        if (team == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("team"), team);
    }

    public static Specification<TeamRound> byRound(Round round) {
        log.debug("TeamRoundSpecification.byRound called with round={}", round);
        if (round == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round"), round);
    }
}