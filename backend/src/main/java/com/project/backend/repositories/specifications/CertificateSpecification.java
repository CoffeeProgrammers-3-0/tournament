package com.project.backend.repositories.specifications;

import com.project.backend.models.Certificate;
import com.project.backend.models.constants.CertificateStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class CertificateSpecification {
    public static Specification<Certificate> byReceiverId(Long receiverId) {
        log.debug("CertificateSpecification.byReceiverId called with receiverId={}", receiverId);
        if (receiverId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("receiver").get("id"), receiverId);
    }

    public static Specification<Certificate> byCreatorId(Long creatorId) {
        log.debug("CertificateSpecification.byCreatorId called with creatorId={}", creatorId);
        if (creatorId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("creator").get("id"), creatorId);
    }

    public static Specification<Certificate> byStatus(CertificateStatus status) {
        log.debug("CertificateSpecification.byStatus called with status={}", status);
        if (status == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("status"), status);
    }
}
