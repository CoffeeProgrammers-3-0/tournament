package com.project.backend.services.interfaces;

import com.project.backend.models.Submission;
import com.project.backend.models.User;
import org.springframework.data.domain.Page;

public interface SubmissionService {
    Submission create(Long roundId, User creator, Submission submission);

    Submission update(Long submissionId, Submission submission);

    void delete(Long submissionId);

    Submission findById(Long submissionId);

    Page<Submission> findAllForJury(User jury, Integer page, Integer size);

    Page<Submission> findAllByRound(Long roundId, Integer page, Integer size);

    Submission setJury(Long submissionId, Long juryId);

    Submission removeJury(Long submissionId, Long juryId);
}
