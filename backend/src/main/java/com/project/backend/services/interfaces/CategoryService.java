package com.project.backend.services.interfaces;

import com.project.backend.models.Category;

import java.util.List;

public interface CategoryService {
    Category create(Long roundId, Category category);

    Category update(Long categoryId, Category category);

    void delete(Long categoryId);

    List<Category> findAllByRound(Long roundId, String search);
}
