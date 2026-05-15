package com.project.backend.controllers;

import com.project.backend.dto.criteria.CriteriaRequest;
import com.project.backend.dto.criteria.CriteriaResponse;
import com.project.backend.mappers.CriteriaMapper;
import com.project.backend.models.Criteria;
import com.project.backend.services.interfaces.CriteriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/categories/{category_id}/criteria")
@Tag(name = "Criteria", description = "API for managing criteria inside a category")
public class CriteriaController {
    private final CriteriaService criteriaService;
    private final CriteriaMapper criteriaMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Create criteria", description = "Creates a new criteria inside the specified category")
    public CriteriaResponse create(
            @Parameter(description = "ID of the category where the criteria will be created", example = "1")
            @PathVariable(value = "category_id") Long categoryId,

            @Parameter(description = "Criteria text data")
            @RequestBody @Valid CriteriaRequest criteriaRequest) {
        Criteria criteria = criteriaService.create(categoryId, criteriaRequest.getText());

        return criteriaMapper.fromCriteriaToResponse(criteria);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{criteria_id}")
    @Operation(summary = "Update criteria", description = "Updates an existing criteria")
    public CriteriaResponse update(
            @Parameter(description = "ID of the criteria to update", example = "5")
            @PathVariable(value = "criteria_id") Long criteriaId,

            @Parameter(description = "Updated criteria text")
            @RequestBody @Valid CriteriaRequest criteriaRequest) {
        Criteria criteria = criteriaService.update(criteriaId, criteriaRequest.getText());

        return criteriaMapper.fromCriteriaToResponse(criteria);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{criteria_id}")
    @Operation(summary = "Delete criteria", description = "Deletes a criteria by its ID")
    public void delete(
            @Parameter(description = "ID of the criteria to delete", example = "5")
            @PathVariable(value = "criteria_id") Long criteriaId) {
        criteriaService.delete(criteriaId);
    }
}
