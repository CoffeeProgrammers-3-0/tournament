package com.project.backend.repositories;

import com.project.backend.models.join_tables.JurySubmissionCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JurySubmissionCriteriaRepository extends JpaRepository<JurySubmissionCriteria, Long>, JpaSpecificationExecutor<JurySubmissionCriteria> {
}