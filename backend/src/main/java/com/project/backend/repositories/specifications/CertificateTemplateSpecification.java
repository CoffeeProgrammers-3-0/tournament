package com.project.backend.repositories.specifications;

import com.project.backend.models.CertificateTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class CertificateTemplateSpecification {
    public static Specification<CertificateTemplate> byName(String name) {
        log.debug("CertificateTemplateSpecification.byName called with name={}", name);
        if (name == null || name.isBlank()) return null;

        return (root, query, cb) ->
                cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }
}
