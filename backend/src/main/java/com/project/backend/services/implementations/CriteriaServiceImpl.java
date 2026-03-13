package com.project.backend.services.implementations;

import com.project.backend.models.Category;
import com.project.backend.models.Criteria;
import com.project.backend.repositories.CategoryRepository;
import com.project.backend.repositories.CriteriaRepository;
import com.project.backend.services.interfaces.CriteriaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CriteriaServiceImpl implements CriteriaService {
    private final CriteriaRepository criteriaRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Criteria create(Long categoryId, String text) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new EntityNotFoundException("Category with id " + categoryId + " not found"));
        Criteria criteria = new Criteria();
        criteria.setCategory(category);
        criteria.setText(text);
        return criteriaRepository.save(criteria);
    }

    @Override
    public Criteria update(Long criteriaId, String text) {
        Criteria criteriaToUpdate = findById(criteriaId);
        criteriaToUpdate.setText(text);
        return criteriaRepository.save(criteriaToUpdate);
    }

    private Criteria findById(Long criteriaId) {
        return criteriaRepository.findById(criteriaId).orElseThrow(() -> new EntityNotFoundException("Criteria with id " + criteriaId + " not found"));
    }

    @Override
    public void delete(Long criteriaId) {
        Criteria criteria = findById(criteriaId);
        criteriaRepository.delete(criteria);
    }
}
