package com.project.backend.services.interfaces;

import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface JurySubmissionCriteriaService {
    @Transactional
    JurySubmissionCriteria set(Long jscId,
                               Long submissionId,
                               Long criteriaId,
                               Long value,
                               boolean isAdditional,
                               String comment,
                               User jury);

    List<JurySubmissionCriteria> findAllBySubmissionForJury(Long submissionId, User jury);
}
