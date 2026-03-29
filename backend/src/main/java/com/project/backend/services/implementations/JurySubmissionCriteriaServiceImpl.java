package com.project.backend.services.implementations;

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

    @Override
    @Transactional
    public JurySubmissionCriteria set(Long submissionId, Long criteriaId, Long value, User jury) {
        JurySubmission jurySubmission = findJurySubmissionById(submissionId, jury.getId());

        JurySubmissionCriteriaId id = new JurySubmissionCriteriaId();
        id.setJurySubmissionId(jurySubmission.getId());
        id.setCriteriaId(criteriaId);

        Optional<JurySubmissionCriteria> optional = jurySubmissionCriteriaRepository.findById(id);
        JurySubmissionCriteria jurySubmissionCriteria = optional.orElseGet(JurySubmissionCriteria::new);

        jurySubmissionCriteria.setId(id);
        jurySubmissionCriteria.setPoints(value);

        Criteria criteria = criteriaRepository.findById(criteriaId)
                .orElseThrow(() -> new EntityNotFoundException("Criteria with id "+criteriaId+" not found"));
        jurySubmissionCriteria.setCriteria(criteria);

        jurySubmissionCriteria.setJurySubmission(jurySubmission);

        return jurySubmissionCriteriaRepository.save(jurySubmissionCriteria);
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
