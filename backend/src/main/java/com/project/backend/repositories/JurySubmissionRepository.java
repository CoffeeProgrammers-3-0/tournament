package com.project.backend.repositories;

import com.project.backend.models.join_tables.JurySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JurySubmissionRepository extends JpaRepository<JurySubmission, Long>, JpaSpecificationExecutor<JurySubmission> {
}
