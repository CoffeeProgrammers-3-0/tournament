package com.project.backend.services.implementations;

import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.repositories.JurySubmissionCriteriaRepository;
import com.project.backend.services.interfaces.JurySubmissionCriteriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JurySubmissionCriteriaServiceImpl implements JurySubmissionCriteriaService {
    private final JurySubmissionCriteriaRepository jurySubmissionCriteriaRepository;

    @Override
    public JurySubmissionCriteria create(Long submissionId, Long criteriaId, Long value) {
        // TODO
        return null;
    }

    @Override
    public JurySubmissionCriteria update(Long submissionId, Long criteriaId, Long value) {
        // TODO
        return null;
    }

    @Override
    public List<JurySubmissionCriteria> findAllBySubmissionForJury(Long submissionId, User jury) {
        // TODO
        return List.of();
    }
}
