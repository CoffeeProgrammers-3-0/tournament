package com.project.backend.services.implementations;

import com.project.backend.models.Category;
import com.project.backend.models.Round;
import com.project.backend.repositories.CategoryRepository;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.specifications.CategorySpecification;
import com.project.backend.services.interfaces.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final RoundRepository roundRepository;

    @Override
    public Category create(Long roundId, Category category) {
        Round round = roundRepository.findById(roundId).orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));
        category.setRound(round);
        return categoryRepository.save(category);
    }

    @Override
    public Category update(Long categoryId, Category category) {
        Category categoryToUpdate = findById(categoryId);
        categoryToUpdate.setWeight(category.getWeight());
        categoryToUpdate.setTitle(category.getTitle());
        return categoryRepository.save(categoryToUpdate);
    }

    @Override
    public void delete(Long categoryId) {
        Category category = findById(categoryId);
        categoryRepository.delete(category);
    }

    private Category findById(Long categoryId) {
        return categoryRepository.findById(categoryId).orElseThrow(() -> new EntityNotFoundException("Category with id " + categoryId + " not found"));
    }

    @Override
    public List<Category> findAllByRound(Long roundId, String search) {
        return categoryRepository.findAll(Specification.allOf(CategorySpecification.byRoundId(roundId), CategorySpecification.byTitle(search)), Sort.by(Sort.Direction.ASC, "title"));
    }
}
