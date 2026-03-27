package com.project.backend.services.interfaces;

import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmissionCriteria;

import java.util.List;

public interface JurySubmissionCriteriaService {
    JurySubmissionCriteria set(Long submissionId, Long criteriaId, Long value, User jury);

    List<JurySubmissionCriteria> findAllBySubmissionForJury(Long submissionId, User jury);
}
