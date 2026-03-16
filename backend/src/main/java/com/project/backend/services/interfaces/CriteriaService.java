package com.project.backend.services.interfaces;

import com.project.backend.models.Criteria;

public interface CriteriaService {
    Criteria create(Long categoryId, String text);

    Criteria update(Long criteriaId, String text);

    void delete(Long criteriaId);
}
