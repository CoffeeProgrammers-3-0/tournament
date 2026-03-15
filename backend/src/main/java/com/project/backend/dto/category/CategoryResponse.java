package com.project.backend.dto.category;

import com.project.backend.dto.criteria.CriteriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "CategoryResponse", description = "DTO representing a category with its criteria")
public class CategoryResponse {

    @Schema(description = "ID of the category", example = "1")
    private Long id;

    @Schema(description = "Title of the category", example = "Database")
    private String title;

    @Schema(description = "Weight of the category (for evaluating)", example = "0.5")
    private Double weight;

    @Schema(description = "List of criteria associated with the category")
    private List<CriteriaResponse> criteria;
}
