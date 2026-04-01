package com.project.backend.services.implementations;

import com.project.backend.models.Category;
import com.project.backend.models.Criteria;
import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.repositories.CategoryRepository;
import com.project.backend.repositories.CriteriaRepository;
import com.project.backend.repositories.specifications.CriteriaSpecification;
import com.project.backend.services.interfaces.CriteriaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CriteriaServiceImpl implements CriteriaService {
    private final CriteriaRepository criteriaRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Criteria create(Long categoryId, String text) {

        if (categoryId == null || text == null || text.isBlank()) {
            throw new IllegalArgumentException("categoryId and text must not be null or empty");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        Round round = category.getRound();
        if(round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot add criteria to an EVALUATED round");
        }

        if (criteriaRepository.exists(
                Specification.allOf(CriteriaSpecification.byCategoryId(categoryId), CriteriaSpecification.byTextEqual(text))
        )) {
            throw new IllegalStateException("Criteria with same text already exists in category");
        }

        Criteria criteria = new Criteria();
        criteria.setCategory(category);
        criteria.setText(text);

        return criteriaRepository.save(criteria);
    }

    @Override
    @Transactional
    public Criteria update(Long criteriaId, String text) {

        if (criteriaId == null || text == null || text.isBlank()) {
            throw new IllegalArgumentException("criteriaId and text must not be null or empty");
        }

        Criteria criteria = findById(criteriaId);

        Round round = criteria.getCategory().getRound();
        if(round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Can not modify criteria to an EVALUATED round");
        }

        if (criteriaRepository.exists(
                Specification.allOf(CriteriaSpecification.byCategoryId(criteria.getCategory().getId()), CriteriaSpecification.byTextEqual(text))
        )) {
            throw new IllegalStateException("Criteria with same text already exists in category");
        }

        criteria.setText(text);

        return criteriaRepository.save(criteria);
    }

    private Criteria findById(Long criteriaId) {
        return criteriaRepository.findById(criteriaId).orElseThrow(() -> new EntityNotFoundException("Criteria with id " + criteriaId + " not found"));
    }

    @Override
    @Transactional
    public void delete(Long criteriaId) {
        if (criteriaId == null) {
            throw new IllegalArgumentException("criteriaId must not be null");
        }

        Criteria criteria = findById(criteriaId);

        Round round = criteria.getCategory().getRound();
        if(round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot delete criteria from an EVALUATED round");
        }

        criteriaRepository.delete(criteria);
    }
}
