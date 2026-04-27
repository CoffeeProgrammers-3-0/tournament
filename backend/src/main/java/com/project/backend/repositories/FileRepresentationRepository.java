package com.project.backend.repositories;

import com.project.backend.models.FileRepresentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface FileRepresentationRepository extends JpaRepository<FileRepresentation, Long>, JpaSpecificationExecutor<FileRepresentation> {
}
