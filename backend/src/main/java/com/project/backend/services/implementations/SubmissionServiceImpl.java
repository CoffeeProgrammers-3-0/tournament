package com.project.backend.services.implementations;

import com.project.backend.dto.event.PointsChangedForTeamEvent;
import com.project.backend.models.Round;
import com.project.backend.models.Submission;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.JurySubmissionSpecification;
import com.project.backend.repositories.specifications.SubmissionSpecification;
import com.project.backend.repositories.specifications.TeamSpecification;
import com.project.backend.services.interfaces.SubmissionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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

    private final ApplicationEventPublisher eventPublisher;

    @Override
    public Submission check(Long roundId, Long userId) {
        return submissionRepository.findOne(Specification.allOf(SubmissionSpecification.byRoundId(roundId), SubmissionSpecification.byUserTeam(userId))).orElse(null);
    }

    @Override
    @Transactional
    public Submission create(Long roundId, User creator, Submission submission) {

        if (roundId == null || creator == null || submission == null) {
            throw new IllegalArgumentException("roundId, creator, submission must not be null");
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round not found"));

        if (round.getStatus() != RoundStatus.ACTIVE) {
            throw new IllegalStateException("Submissions allowed only in ACTIVE round");
        }

        Team team = teamRepository.findOne(
                Specification.allOf(
                        TeamSpecification.byUserId(creator.getId()),
                        TeamSpecification.byRoundId(roundId)
                )
        ).orElseThrow(() -> new EntityNotFoundException("Team not found for this round"));

        if (submissionRepository.exists(
                Specification.allOf(
                        SubmissionSpecification.byRoundId(roundId),
                        SubmissionSpecification.byTeamId(team.getId())
                )
        )) {
            throw new IllegalStateException("Team already has submission in this round");
        }

        submission.setRound(round);
        submission.setTeam(team);
        return submissionRepository.save(submission);
    }

    @Override
    @Transactional
    public Submission update(Long submissionId, Submission submission) {

        if (submissionId == null || submission == null) {
            throw new IllegalArgumentException("submissionId and submission must not be null");
        }

        Submission existing = findById(submissionId);
        Round round = existing.getRound();

        if (round.getStatus() != RoundStatus.ACTIVE) {
            throw new IllegalStateException("Submissions allowed only in ACTIVE round");
        }

        existing.setDescription(submission.getDescription());
        existing.setVideoLink(submission.getVideoLink());
        existing.setGithubLink(submission.getGithubLink());

        return submissionRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long submissionId) {

        if (submissionId == null) {
            throw new IllegalArgumentException("submissionId must not be null");
        }

        Submission submission = findById(submissionId);
        Round round = submission.getRound();

        if (round.getStatus() != RoundStatus.ACTIVE) {
            throw new IllegalStateException("Submissions allowed only in ACTIVE round");
        }

        PointsChangedForTeamEvent event = new PointsChangedForTeamEvent(submission.getTeam().getId(),round.getId());

        submissionRepository.delete(submission);

        eventPublisher.publishEvent(event);
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

        if (submissionId == null || juryId == null) {
            throw new IllegalArgumentException("submissionId and juryId must not be null");
        }

        Submission submission = findById(submissionId);
        Round round = submission.getRound();

        if (round.getStatus() != RoundStatus.SUBMISSION_CLOSED) {
            throw new IllegalStateException("Jury can be assigned only after submission closed");
        }

        if (jurySubmissionRepository.exists(
                Specification.allOf(
                        JurySubmissionSpecification.bySubmissionId(submissionId),
                        JurySubmissionSpecification.byJuryId(juryId)
                )
        )) {
            throw new IllegalStateException("Jury already assigned");
        }

        User jury = userRepository.findById(juryId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (jury.getRole() != Role.JURY) {
            throw new IllegalStateException("User must be jury");
        }

        JurySubmission jurySubmission = new JurySubmission();
        jurySubmission.setJury(jury);
        jurySubmission.setSubmission(submission);

        jurySubmissionRepository.save(jurySubmission);

        PointsChangedForTeamEvent event = new PointsChangedForTeamEvent(submission.getTeam().getId(),round.getId());
        eventPublisher.publishEvent(event);

        return submission;
    }

    @Override
    @Transactional
    public Submission removeJury(Long submissionId, Long juryId) {

        if (submissionId == null || juryId == null) {
            throw new IllegalArgumentException("submissionId and juryId must not be null");
        }

        Submission submission = findById(submissionId);
        Round round = submission.getRound();

        if (round.getStatus() != RoundStatus.SUBMISSION_CLOSED) {
            throw new IllegalStateException("Jury can be removed only during evaluation phase");
        }

        if (!jurySubmissionRepository.exists(
                Specification.allOf(
                        JurySubmissionSpecification.bySubmissionId(submissionId),
                        JurySubmissionSpecification.byJuryId(juryId)
                )
        )) {
            throw new IllegalStateException("Jury not assigned");
        }

        jurySubmissionRepository.delete(
                JurySubmissionSpecification.bySubmissionIdAndJuryId(submissionId, juryId)
        );

        PointsChangedForTeamEvent event = new PointsChangedForTeamEvent(submission.getTeam().getId(),round.getId());
        eventPublisher.publishEvent(event);

        return submission;
    }
}
