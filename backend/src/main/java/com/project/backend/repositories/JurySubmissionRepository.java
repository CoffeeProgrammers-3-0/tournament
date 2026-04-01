package com.project.backend.repositories;

import com.project.backend.models.join_tables.JurySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface JurySubmissionRepository extends JpaRepository<JurySubmission, Long>, JpaSpecificationExecutor<JurySubmission> {
    @Query("SELECT COUNT(js) > 0 FROM JurySubmission js " +
            "WHERE js.submission.id = :submissionId AND js.jury.id = :juryId")
    boolean isJuryAssignedToSubmission(Long submissionId, Long juryId);
}
