package com.project.backend.services.implementations;

import com.project.backend.models.Category;
import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final RoundRepository roundRepository;

    @Override
    @Transactional
    public Category create(Long roundId, Category category) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));

        if (round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot add categories to an EVALUATED round");
        }

        category.setRound(round);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category update(Long categoryId, Category category) {
        Category categoryToUpdate = findById(categoryId);

        if (categoryToUpdate.getRound().getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot update categories in an EVALUATED round");
        }

        categoryToUpdate.setWeight(category.getWeight());
        categoryToUpdate.setTitle(category.getTitle());
        return categoryRepository.save(categoryToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long categoryId) {
        Category category = findById(categoryId);

        if (category.getRound().getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot delete categories from an EVALUATED round");
        }

        if (!category.getCriteria().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with existing criteria");
        }

        categoryRepository.delete(category);
    }

    private Category findById(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category with id " + categoryId + " not found"));
    }

    @Override
    public List<Category> findAllByRound(Long roundId, String search) {
        return categoryRepository.findAll(
                Specification.allOf(
                        CategorySpecification.byRoundId(roundId),
                        CategorySpecification.byTitle(search)
                ),
                Sort.by(Sort.Direction.ASC, "title")
        );
    }
}