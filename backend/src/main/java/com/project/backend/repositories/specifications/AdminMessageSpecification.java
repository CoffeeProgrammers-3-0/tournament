package com.project.backend.repositories.specifications;

import com.project.backend.models.adminMessages.AdminMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class AdminMessageSpecification {

    public static Specification<AdminMessage> byCreatorId(Long creatorId) {
        log.debug("AdminMessageSpecification.byCreatorId called with creatorId={}", creatorId);
        if (creatorId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("creator").get("id"), creatorId);
    }

    public static Specification<AdminMessage> byContent(String content) {
        log.debug("AdminMessageSpecification.byContent called with content={}", content);
        if (content == null || content.isBlank()) return null;
        return (root, query, cb) -> 
                cb.like(cb.lower(root.get("content")), "%" + content.toLowerCase() + "%");
    }

    public static Specification<AdminMessage> byId(Long id) {
        log.debug("AdminMessageSpecification.byId called with id={}", id);
        return (root, query, cb) -> {
            if (id == null) {
                return cb.disjunction();
            }
            return cb.equal(root.get("id"), id);
        };
    }
}