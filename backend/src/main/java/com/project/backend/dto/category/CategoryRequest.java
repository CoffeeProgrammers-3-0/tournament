package com.project.backend.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "CategoryRequest", description = "DTO for creating or updating a category")
public class CategoryRequest {

    @Schema(description = "Title of the category", example = "Database")
    private String title;

    @Schema(description = "Weight of the category (for evaluating)", example = "0.5")
    private Double weight;
}
