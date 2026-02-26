package com.project.backend.services.implementations;

import com.project.backend.models.Submission;
import com.project.backend.models.User;
import com.project.backend.repositories.SubmissionRepository;
import com.project.backend.services.interfaces.SubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;

    @Override
    public Submission create(Long roundId, User creator, Submission submission) {
        // TODO
        return null;
    }

    @Override
    public Submission update(Long submissionId, Submission submission) {
        // TODO
        return null;
    }

    @Override
    public void delete(Long submissionId) {
        // TODO
    }

    @Override
    public Submission findById(Long submissionId) {
        // TODO
        return null;
    }

    @Override
    public Page<Submission> findAllForJury(User jury) {
        // TODO
        return null;
    }

    @Override
    public Page<Submission> findAllByRound(Long roundId) {
        // TODO
        return null;
    }

    @Override
    public Submission setJury(Long submissionId, Long juryId) {
        // TODO
        return null;
    }
}
