package com.project.backend.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(name = "CategoryRequest", description = "DTO for creating or updating a category")
public class CategoryRequest {

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 255, message = "Title size must be less than 255 characters")
    @Schema(description = "Title of the category", example = "Database")
    private String title;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.0", message = "Weight cannot be less than 0.0")
    @Schema(description = "Weight of the category (for evaluating)", example = "0.5")
    private Double weight;
}
