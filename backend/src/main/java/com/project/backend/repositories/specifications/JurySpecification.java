package com.project.backend.repositories.specifications;

import com.project.backend.models.Round;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.Jury;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class JurySpecification {

    public static Specification<Jury> byUserId(Long userId) {
        log.debug("JurySpecification.byUserId called with userId={}", userId);
        if (userId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("userId"), userId);
    }

    public static Specification<Jury> byRoundId(Long roundId) {
        log.debug("JurySpecification.byRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id").get("roundId"), roundId);
    }

    public static Specification<Jury> byUser(User user) {
        log.debug("JurySpecification.byUser called with user={}", user);
        if (user == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("user"), user);
    }

    public static Specification<Jury> byRound(Round round) {
        log.debug("JurySpecification.byRound called with round={}", round);
        if (round == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("round"), round);
    }

    public static Specification<Jury> byUserIdAndRoundId(Long userId, Long roundId) {
        return Specification.allOf(byUserId(userId), byRoundId(roundId));
    }
}