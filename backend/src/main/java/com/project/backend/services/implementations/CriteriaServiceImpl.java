package com.project.backend.services.implementations;

import com.project.backend.models.Criteria;
import com.project.backend.repositories.CriteriaRepository;
import com.project.backend.services.interfaces.CriteriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CriteriaServiceImpl implements CriteriaService {
    private final CriteriaRepository criteriaRepository;

    @Override
    public Criteria create(Long categoryId, String text) {
        // TODO
        return null;
    }

    @Override
    public Criteria update(Long criteriaId, String text) {
        // TODO
        return null;
    }

    @Override
    public void delete(Long criteriaId) {
        // TODO
    }
}
