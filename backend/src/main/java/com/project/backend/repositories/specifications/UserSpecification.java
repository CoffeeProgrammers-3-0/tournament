package com.project.backend.repositories.specifications;

import com.project.backend.models.User;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class UserSpecification {
    public static Specification<User> byId(Long id) {
        log.debug("UserSpecification.byId called with id={}", id);

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }

    public static Specification<User> byEmail(String email) {
        log.debug("UserSpecification.byEmail called with email={}", email);

        return (root, query, cb) ->
                cb.equal(root.get("email"), email);
    }

    public static Specification<User> byKeycloakUserId(String keycloakUserId) {
        log.debug("UserSpecification.byKeycloakUserId called with keycloakUserId={}", keycloakUserId);

        return (root, query, cb) ->
                cb.equal(root.get("keycloakUserId"), keycloakUserId);
    }

    public static Specification<User> byFirstName(String firstName) {
        log.debug("UserSpecification.byFirstName called with firstName={}", firstName);

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%");
    }

    public static Specification<User> byLastName(String lastName) {
        log.debug("UserSpecification.byLastName called with lastName={}", lastName);

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("lastName")), "%" + lastName.toLowerCase() + "%");
    }

    public static Specification<User> byRole(String role) {
        log.debug("UserSpecification.byRole called with role={}", role);

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("role")), "%" + role.toLowerCase() + "%");
    }

    public static Specification<User> bySearchTerm(String searchTerm) {
        log.debug("UserSpecification.bySearchTerm called with searchTerm={}", searchTerm);

        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isBlank()) {
                return cb.conjunction();
            }

            String[] parts = searchTerm.trim().split("\\s+");
            List<Predicate> predicates = new ArrayList<>();

            for (String part : parts) {
                String likePattern = "%" + part.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("firstName")), likePattern));
                predicates.add(cb.like(cb.lower(root.get("lastName")), likePattern));
                predicates.add(cb.like(cb.lower(root.get("email")), likePattern));
            }

            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }
}
