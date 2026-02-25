package com.project.backend.repositories.specifications;

import com.project.backend.models.Team;
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
}