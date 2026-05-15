package com.project.backend.repositories.specifications;

import com.project.backend.models.FileRepresentation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class FileRepresentationSpecification {
    public static Specification<FileRepresentation> byId(Long id) {
        log.debug("FileRepresentationSpecification.byId called with id={}", id);
        if (id == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("id"), id);
    }
    public static Specification<FileRepresentation> byUploaderId(Long uploaderId) {
        log.debug("FileRepresentationSpecification.byUploaderId called with uploaderId={}", uploaderId);
        if (uploaderId == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("uploader").get("id"), uploaderId);
    }

    public static Specification<FileRepresentation> byFileHash(String fileHash) {
        log.debug("FileRepresentationSpecification.byFileHash called with fileHash={}", fileHash);
        if (fileHash == null) return null;

        return (root, query, cb) ->
                cb.equal(root.get("fileHash"), fileHash);
    }
}
