package com.project.backend.dto.category;

import com.project.backend.dto.criteria.CriteriaResponse;
import lombok.Data;

import java.util.List;

@Data
public class CategoryResponse {
    private Long id;
    private String title;
    private Double weight;
    private List<CriteriaResponse> criteria;
}
