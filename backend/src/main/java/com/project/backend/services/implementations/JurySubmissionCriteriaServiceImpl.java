package com.project.backend.services.implementations;

import com.project.backend.dto.event.PointsChangedForTeamEvent;
import com.project.backend.models.Criteria;
import com.project.backend.models.User;
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
    public JurySubmissionCriteria set(Long jscId,
                                      Long submissionId,
                                      Long criteriaId,
                                      Long value,
                                      boolean isAdditional,
                                      String comment,
                                      User jury) {

        if (submissionId == null || value == null || jury == null) {
            throw new IllegalArgumentException("SubmissionId, value and jury must not be null");
        }

        if (jury.getId() == null) {
            throw new IllegalArgumentException("Jury must have id");
        }

        if (value < 0) {
            throw new IllegalArgumentException("Points cannot be negative");
        }

        JurySubmission jurySubmission = findJurySubmissionById(submissionId, jury.getId());

        JurySubmissionCriteria jsc;

        boolean isNew = (jscId == null);

        if (isNew) {
            jsc = new JurySubmissionCriteria();
        } else {
            jsc = jurySubmissionCriteriaRepository.findById(jscId)
                    .orElseThrow(() -> new EntityNotFoundException("JSC not found: " + jscId));
        }

        Criteria criteria = null;

        if (!isAdditional) {
            if (criteriaId == null) {
                throw new IllegalArgumentException("criteriaId must not be null for normal criteria");
            }

            criteria = criteriaRepository.findById(criteriaId)
                    .orElseThrow(() -> new EntityNotFoundException("Criteria not found: " + criteriaId));

            if (!criteria.getCategory().getRound().getId()
                    .equals(jurySubmission.getSubmission().getRound().getId())) {
                throw new IllegalStateException("Criteria does not belong to same round");
            }
        }

        if (!isAdditional && isNew) {

            boolean exists = jurySubmissionCriteriaRepository.exists(
                    Specification.allOf(
                            JurySubmissionCriteriaSpecification.byJurySubmissionId(jurySubmission.getId()),
                            JurySubmissionCriteriaSpecification.byCriteriaId(criteriaId)
                    )
            );

            if (exists) {
                throw new IllegalStateException("Criteria already evaluated");
            }
        }

        if (isAdditional && isNew) {
            long countAdditional = jurySubmissionCriteriaRepository.count(
                    Specification.allOf(
                            JurySubmissionCriteriaSpecification.byJurySubmissionId(jurySubmission.getId()),
                            JurySubmissionCriteriaSpecification.isAdditional(true)
                    )
            );

            if (countAdditional >= 4) {
                throw new IllegalStateException("Cannot add more than 4 additional criteria");
            }

            if (value > 5) {
                throw new IllegalStateException("Additional points cannot exceed 5");
            }
        }

        jsc.setJurySubmission(jurySubmission);
        jsc.setCriteria(criteria);
        jsc.setPoints(value);
        jsc.setAdditional(isAdditional);
        jsc.setComment(comment);

        jsc = jurySubmissionCriteriaRepository.save(jsc);

        eventPublisher.publishEvent(
                new PointsChangedForTeamEvent(
                        jsc.getJurySubmission().getSubmission().getTeam().getId(),
                        jsc.getJurySubmission().getSubmission().getRound().getId()
                )
        );

        return jsc;
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
