package com.project.backend.controllers;

import com.project.backend.dto.category.CategoryRequest;
import com.project.backend.dto.category.CategoryResponse;
import com.project.backend.mappers.CategoryMapper;
import com.project.backend.models.Category;
import com.project.backend.services.interfaces.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/rounds/{round_id}/categories")
@Tag(name = "Categories", description = "API for managing categories inside a round")
public class CategoryController {
    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @PostMapping
    @Operation(summary = "Create category", description = "Creates a new category inside the specified round")
    public CategoryResponse create(
            @Parameter(description = "ID of the round where the category will be created", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Category data for creation")
            @RequestBody CategoryRequest categoryRequest) {
        Category category = categoryService.create(roundId, categoryMapper.fromRequestToCategory(categoryRequest));

        return categoryMapper.fromCategoryToResponse(category);
    }

    @PutMapping("/{category_id}")
    @Operation(summary = "Update category", description = "Updates an existing category")
    public CategoryResponse update(
            @Parameter(description = "ID of the category to update", example = "10")
            @PathVariable(value = "category_id") Long categoryId,

            @Parameter(description = "Updated category data")
            @RequestBody CategoryRequest categoryRequest) {
        Category category = categoryService.update(categoryId, categoryMapper.fromRequestToCategory(categoryRequest));

        return categoryMapper.fromCategoryToResponse(category);
    }

    @DeleteMapping("/{category_id}")
    @Operation(summary = "Delete category", description = "Deletes a category by its ID")
    public void delete(
            @Parameter(description = "ID of the category to delete", example = "10")
            @PathVariable(value = "category_id") Long categoryId) {
        categoryService.delete(categoryId);
    }

    @GetMapping
    @Operation(summary = "Get categories", description = "Returns all categories for the specified round. Supports optional search")
    public List<CategoryResponse> getAll(
            @Parameter(description = "ID of the round whose categories will be returned", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Search categories by name", example = "History")
            @RequestParam(value = "search", required = false) String search) {
        List<Category> categoryList = categoryService.findAllByRound(roundId, search);

        return categoryList.stream().map(categoryMapper::fromCategoryToResponse).toList();
    }
}
