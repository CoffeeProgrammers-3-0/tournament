package com.project.backend.repositories.specifications;

import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.join_tables.Jury;
import jakarta.persistence.criteria.Join;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class UserSpecification {
    public static Specification<User> byId(Long id) {
        log.debug("UserSpecification.byId called with id={}", id);
        if(id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<User> byEmail(String email) {
        log.debug("UserSpecification.byEmail called with email={}", email);
        if(email == null || email.isBlank()) return null;

        return (root, query, cb) ->
                cb.equal(root.get("email"), email);
    }

    public static Specification<User> byKeycloakUserId(String keycloakUserId) {
        log.debug("UserSpecification.byKeycloakUserId called with keycloakUserId={}", keycloakUserId);
        if(keycloakUserId == null || keycloakUserId.isBlank()) return null;

        return (root, query, cb) ->
                cb.equal(root.get("keycloakUserId"), keycloakUserId);
    }

    public static Specification<User> byFullName(String fullName) {
        log.debug("UserSpecification.byFullName called with fullName={}", fullName);
        if(fullName == null || fullName.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("fullName")), "%" + fullName.toLowerCase() + "%");
    }

    public static Specification<User> byRole(Role role) {
        log.debug("UserSpecification.byRole called with role={}", role);
        if(role == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("role"), role);
    }

    public static Specification<User> juriesByRoundId(Long roundId) {
        log.debug("UserSpecification.juriesByRoundId called with roundId={}", roundId);
        if (roundId == null) return null;

        return (root, query, cb) -> {
            Join<User, Jury> juryJoin = root.join("juries");

            return cb.equal(juryJoin.get("round").get("id"), roundId);
        };
    }
}
