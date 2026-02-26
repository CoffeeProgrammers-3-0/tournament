package com.project.backend.services.implementations;

import com.project.backend.models.Category;
import com.project.backend.repositories.CategoryRepository;
import com.project.backend.services.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public Category create(Long roundId, Category category) {
        // TODO
        return null;
    }

    @Override
    public Category update(Long categoryId, Category category) {
        // TODO
        return null;
    }

    @Override
    public void delete(Long categoryId) {
        // TODO
    }

    @Override
    public List<Category> findAllByRound(Long roundId, Integer page, Integer size, String search) {
        // TODO
        return List.of();
    }
}
