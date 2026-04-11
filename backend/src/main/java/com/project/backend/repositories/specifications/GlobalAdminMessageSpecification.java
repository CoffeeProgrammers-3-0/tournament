package com.project.backend.repositories.specifications;

import com.project.backend.models.adminMessages.GlobalAdminMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class GlobalAdminMessageSpecification {

    public static Specification<GlobalAdminMessage> byCreatorId(Long creatorId) {
        log.debug("GlobalAdminMessageSpecification.byCreatorId called with creatorId={}", creatorId);
        if (creatorId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("creator").get("id"), creatorId);
    }

    public static Specification<GlobalAdminMessage> byContent(String content) {
        log.debug("GlobalAdminMessageSpecification.byContent called with content={}", content);
        if (content == null || content.isBlank()) return null;
        return (root, query, cb) -> 
                cb.like(cb.lower(root.get("content")), "%" + content.toLowerCase() + "%");
    }

    public static Specification<GlobalAdminMessage> byId(Long id) {
        log.debug("GlobalAdminMessageSpecification.byId called with id={}", id);
        return (root, query, cb) -> {
            if (id == null) {
                return cb.disjunction();
            }
            return cb.equal(root.get("id"), id);
        };
    }
}