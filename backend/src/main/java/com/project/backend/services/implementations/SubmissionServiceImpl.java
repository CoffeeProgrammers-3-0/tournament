package com.project.backend.services.implementations;

import com.project.backend.models.Round;
import com.project.backend.models.Submission;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.JurySubmissionSpecification;
import com.project.backend.repositories.specifications.SubmissionSpecification;
import com.project.backend.repositories.specifications.TeamSpecification;
import com.project.backend.services.interfaces.EvaluationService;
import com.project.backend.services.interfaces.SubmissionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final JurySubmissionRepository jurySubmissionRepository;
    private final EvaluationService evaluationService;

    @Override
    public Submission check(Long roundId, Long userId) {
        return submissionRepository.findOne(Specification.allOf(SubmissionSpecification.byRoundId(roundId), SubmissionSpecification.byUserTeam(userId))).orElse(null);
    }

    @Override
    @Transactional
    public Submission create(Long roundId, User creator, Submission submission) {
        Round round = roundRepository.getReferenceById(roundId);
        Team team = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(creator.getId()), TeamSpecification.byRoundId(roundId))).orElseThrow(() -> new EntityNotFoundException("Team for round with id " + roundId + " for user with id " + creator.getId() + " not found"));
        submission.setRound(round);
        submission.setTeam(team);
        return submissionRepository.save(submission);
    }

    @Override
    @Transactional
    public Submission update(Long submissionId, Submission submission) {
        Submission submissionToUpdate = findById(submissionId);
        submissionToUpdate.setDescription(submission.getDescription());
        submissionToUpdate.setVideoLink(submission.getVideoLink());
        submissionToUpdate.setGithubLink(submission.getGithubLink());
        return submissionRepository.save(submissionToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long submissionId) {
        Submission submission = findById(submissionId);
        submissionRepository.delete(submission);
    }

    @Override
    public Submission findById(Long submissionId) {
        return submissionRepository.findById(submissionId).orElseThrow(() -> new EntityNotFoundException("Submission with id " + submissionId + " not found"));
    }

    @Override
    public Page<Submission> findAllForJury(User jury, Integer page, Integer size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        return submissionRepository.findAll(SubmissionSpecification.byJuryId(jury.getId()), pageRequest);
    }

    @Override
    public Page<Submission> findAllByRound(Long roundId, Integer page, Integer size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        return submissionRepository.findAll(SubmissionSpecification.byRoundId(roundId), pageRequest);
    }

    @Override
    @Transactional
    public Submission setJury(Long submissionId, Long juryId) {
        if(jurySubmissionRepository.exists(Specification.allOf(JurySubmissionSpecification.bySubmissionId(submissionId), JurySubmissionSpecification.byJuryId(juryId)))) {
            throw new IllegalStateException("Jury with id " + juryId + " is already assigned to submission with id " + submissionId);
        }

        User jury = userRepository.getReferenceById(juryId);
        Submission submission = submissionRepository.getReferenceById(submissionId);


        JurySubmission jurySubmission = new JurySubmission();
        jurySubmission.setJury(jury);
        jurySubmission.setSubmission(submission);
        evaluationService.fillWithZeroPoints(jurySubmission);

        jurySubmissionRepository.save(jurySubmission);
        return findById(submissionId);
    }

    @Override
    @Transactional
    public Submission removeJury(Long submissionId, Long juryId) {
        if(!jurySubmissionRepository.exists(Specification.allOf(JurySubmissionSpecification.bySubmissionId(submissionId), JurySubmissionSpecification.byJuryId(juryId)))) {
            throw new IllegalStateException("Jury with id " + juryId + " is not assigned to submission with id " + submissionId);
        }

        jurySubmissionRepository.delete(JurySubmissionSpecification.bySubmissionIdAndJuryId(submissionId, juryId));
        return findById(submissionId);
    }
}
