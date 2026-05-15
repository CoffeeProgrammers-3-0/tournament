package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.adminMessages.RoundAdminMessage;
import com.project.backend.models.join_tables.TeamParticipant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class RoundAdminMessageSpecification {

    public static Specification<RoundAdminMessage> byRoundId(Long roundId) {
        log.debug("RoundAdminMessageSpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("round").get("id"), roundId);
    }

    public static Specification<RoundAdminMessage> byRound(Round round) {
        log.debug("RoundAdminMessageSpecification.byRound called with round={}", round);
        if (round == null) return null;
        return (root, query, cb) -> cb.equal(root.get("round"), round);
    }

    public static Specification<RoundAdminMessage> byCreatorId(Long creatorId) {
        log.debug("RoundAdminMessageSpecification.byCreatorId called with creatorId={}", creatorId);
        if (creatorId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("creator").get("id"), creatorId);
    }

    public static Specification<RoundAdminMessage> byContent(String content) {
        log.debug("RoundAdminMessageSpecification.byContent called with content={}", content);
        if (content == null || content.isBlank()) return null;
        return (root, query, cb) -> 
                cb.like(cb.lower(root.get("content")), "%" + content.toLowerCase() + "%");
    }

    public static Specification<RoundAdminMessage> byId(Long id) {
        log.debug("RoundAdminMessageSpecification.byId called with id={}", id);
        return (root, query, cb) -> {
            if (id == null) {
                return cb.disjunction();
            }
            return cb.equal(root.get("id"), id);
        };
    }

    public static Specification<RoundAdminMessage> byUsersRounds(Long userId) {
        log.debug("RoundAdminMessageSpecification.byUsersRounds called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) -> {
            query.distinct(true);

            var round = root.join("round");
            var tournament = round.join("tournament");

            var subquery = query.subquery(Long.class);
            var subTp = subquery.from(TeamParticipant.class);
            var subTournament = subTp.join("tournament");

            subquery.select(subTp.get("team").get("id"))
                    .where(
                            cb.equal(subTp.get("user").get("id"), userId),
                            cb.equal(subTournament.get("id"), tournament.get("id"))
                    );


            var teamRound = round.join("teamRounds");
            var team = teamRound.join("team");

            return team.get("id").in(subquery);
        };
    }
}