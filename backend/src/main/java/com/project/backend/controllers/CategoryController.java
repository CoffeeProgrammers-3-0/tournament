package com.project.backend.controllers;

import com.project.backend.dto.category.CategoryRequest;
import com.project.backend.dto.category.CategoryResponse;
import com.project.backend.mappers.CategoryMapper;
import com.project.backend.models.Category;
import com.project.backend.services.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/rounds/{round_id}/categories")
public class CategoryController {
    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @PostMapping
    public CategoryResponse create(@PathVariable(value = "round_id") Long roundId, @RequestBody CategoryRequest categoryRequest) {
        Category category = categoryService.create(roundId, categoryMapper.fromRequestToCategory(categoryRequest));

        return categoryMapper.fromCategoryToResponse(category);
    }

    @PutMapping("/{category_id}")
    public CategoryResponse update(@PathVariable(value = "category_id") Long categoryId, @RequestBody CategoryRequest categoryRequest) {
        Category category = categoryService.update(categoryId, categoryMapper.fromRequestToCategory(categoryRequest));

        return categoryMapper.fromCategoryToResponse(category);
    }

    @DeleteMapping("/{category_id}")
    public void delete(@PathVariable(value = "category_id") Long categoryId) {
        categoryService.delete(categoryId);
    }

    @GetMapping
    public List<CategoryResponse> getAll(@PathVariable(value = "round_id") Long roundId, @RequestParam(value = "search", required = false) String search) {
        List<Category> categoryList = categoryService.findAllByRound(roundId, search);

        return categoryList.stream().map(categoryMapper::fromCategoryToResponse).toList();
    }
}
