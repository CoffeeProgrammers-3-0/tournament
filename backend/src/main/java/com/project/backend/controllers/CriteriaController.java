package com.project.backend.controllers;

import com.project.backend.dto.criteria.CriteriaResponse;
import com.project.backend.dto.wrapper.StringRequest;
import com.project.backend.mappers.CriteriaMapper;
import com.project.backend.models.Criteria;
import com.project.backend.services.interfaces.CriteriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/categories/{category_id}/criteria")
public class CriteriaController {
    private final CriteriaService criteriaService;
    private final CriteriaMapper criteriaMapper;

    @PostMapping
    public CriteriaResponse create(@PathVariable(value = "category_id") Long categoryId, @RequestBody StringRequest stringRequest) {
        Criteria criteria = criteriaService.create(categoryId, stringRequest.getText());

        return criteriaMapper.fromCriteriaToResponse(criteria);
    }

    @PutMapping("/{criteria_id}")
    public CriteriaResponse update(@PathVariable(value = "criteria_id") Long criteriaId, @RequestBody StringRequest stringRequest) {
        Criteria criteria = criteriaService.update(criteriaId, stringRequest.getText());

        return criteriaMapper.fromCriteriaToResponse(criteria);
    }

    @DeleteMapping("/{criteria_id}")
    public void delete(@PathVariable(value = "criteria_id") Long criteriaId) {
        criteriaService.delete(criteriaId);
    }
}
