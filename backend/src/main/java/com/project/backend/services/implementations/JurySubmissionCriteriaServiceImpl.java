package com.project.backend.services.implementations;

import com.project.backend.dto.event.PointsChangedForTeamEvent;
import com.project.backend.models.Criteria;
import com.project.backend.models.User;
import com.project.backend.models.ids.JurySubmissionCriteriaId;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.repositories.CriteriaRepository;
import com.project.backend.repositories.JurySubmissionCriteriaRepository;
import com.project.backend.repositories.JurySubmissionRepository;
import com.project.backend.repositories.specifications.JurySubmissionCriteriaSpecification;
import com.project.backend.repositories.specifications.JurySubmissionSpecification;
import com.project.backend.services.interfaces.JurySubmissionCriteriaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class JurySubmissionCriteriaServiceImpl implements JurySubmissionCriteriaService {
    private final JurySubmissionCriteriaRepository jurySubmissionCriteriaRepository;
    private final JurySubmissionRepository jurySubmissionRepository;
    private final CriteriaRepository criteriaRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @Override
    public JurySubmissionCriteria set(Long submissionId, Long criteriaId, Long value, boolean isAdditional, String comment, User jury) {
        if (submissionId == null || criteriaId == null || value == null || jury == null) {
            throw new IllegalArgumentException("SubmissionId, criteriaId, value and jury must not be null");
        }

        if (jury.getId() == null) {
            throw new IllegalArgumentException("Jury must have id");
        }

        if (value < 0) {
            throw new IllegalArgumentException("Points value cannot be negative");
        }

        JurySubmission jurySubmission = findJurySubmissionById(submissionId, jury.getId());

        Criteria criteria = criteriaRepository.findById(criteriaId)
                .orElseThrow(() -> new EntityNotFoundException("Criteria with id " + criteriaId + " not found"));

        if (!criteria.getCategory().getRound().getId().equals(jurySubmission.getSubmission().getRound().getId())) {
            throw new IllegalStateException("Criteria does not belong to the same round as submission");
        }

        JurySubmissionCriteriaId id = new JurySubmissionCriteriaId();
        id.setJurySubmissionId(jurySubmission.getId());
        id.setCriteriaId(criteriaId);

        Optional<JurySubmissionCriteria> optional = jurySubmissionCriteriaRepository.findById(id);

        JurySubmissionCriteria jurySubmissionCriteria = optional.orElseGet(JurySubmissionCriteria::new);

        long countAdditional = isAdditional ? jurySubmissionCriteriaRepository.count(
                Specification.allOf(
                        JurySubmissionCriteriaSpecification.isAdditional(true),
                        JurySubmissionCriteriaSpecification.byJurySubmissionId(jurySubmission.getId())
                )) : 0;

        if (optional.isPresent()) {
            if(value.equals(jurySubmissionCriteria.getPoints())) {
                log.debug("Skip update: same value {} for criteria {} and submission {}", value, criteriaId, submissionId);
                return jurySubmissionCriteria;
            }
            if(isAdditional && !jurySubmissionCriteria.isAdditional()) {
                if(countAdditional >= 4) {
                    throw new IllegalStateException("Can not add new additional jsc, because there are already 4 additional");
                }
            }
        }

        if(isAdditional) {
            if(countAdditional >= 4) {
                throw new IllegalStateException("Can not add new additional jsc, because there are already 4 additional");
            }
            if(value > 5) {
                throw new IllegalStateException("Can create additional jsc with points more than 5");
            }
        }

        jurySubmissionCriteria.setId(id);
        jurySubmissionCriteria.setPoints(value);
        jurySubmissionCriteria.setCriteria(criteria);
        jurySubmissionCriteria.setJurySubmission(jurySubmission);
        jurySubmissionCriteria.setAdditional(isAdditional);
        jurySubmissionCriteria.setComment(comment);

        log.info("Set points {} for submission {} criteria {} by jury {} additional {}",
                value, submissionId, criteriaId, jury.getId(), isAdditional);
        jurySubmissionCriteria = jurySubmissionCriteriaRepository.save(jurySubmissionCriteria);

        PointsChangedForTeamEvent event = new PointsChangedForTeamEvent(
                jurySubmissionCriteria.getJurySubmission().getSubmission().getTeam().getId(),
                jurySubmissionCriteria.getJurySubmission().getSubmission().getRound().getId()
        );
        eventPublisher.publishEvent(event);

        return jurySubmissionCriteria;
    }

    private JurySubmissionCriteria findById(Long jurySubmissionId, Long criteriaId) {
        return jurySubmissionCriteriaRepository.findOne(Specification.allOf(
                        JurySubmissionCriteriaSpecification.byJurySubmissionId(jurySubmissionId),
                        JurySubmissionCriteriaSpecification.byCriteriaId(criteriaId)
                )
        ).orElseThrow(() -> new EntityNotFoundException("JurySubmissionCriteria for JurySubmission with id " + jurySubmissionId + " and criteria with id " + criteriaId + " not found"));
    }

    private JurySubmission findJurySubmissionById(Long submissionId, Long juryId) {
        return jurySubmissionRepository.findOne(Specification.allOf(JurySubmissionSpecification.bySubmissionId(submissionId), JurySubmissionSpecification.byJuryId(juryId))).orElseThrow(() -> new EntityNotFoundException("Jury with id " + juryId + " is not assigned to submission with id " + submissionId));
    }

    @Override
    public List<JurySubmissionCriteria> findAllBySubmissionForJury(Long submissionId, User jury) {
        JurySubmission jurySubmission = findJurySubmissionById(submissionId, jury.getId());
        return jurySubmissionCriteriaRepository.findAll(JurySubmissionCriteriaSpecification.byJurySubmissionId(jurySubmission.getId()), Sort.by(Sort.Direction.ASC, "criteria.text"));
    }
}
