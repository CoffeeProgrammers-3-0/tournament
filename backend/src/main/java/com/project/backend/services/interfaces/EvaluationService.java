package com.project.backend.services.interfaces;

import com.project.backend.models.join_tables.JurySubmission;

public interface EvaluationService {
    void assignSubmissionsToJury(Long roundId, int k);

    void fillWithZeroPoints(JurySubmission assignment);
}
