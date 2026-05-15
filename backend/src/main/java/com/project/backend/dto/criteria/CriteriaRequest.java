package com.project.backend.dto.criteria;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(name = "CriteriaRequest", description = "DTO for creating or updating a single evaluation criterion")
public class CriteriaRequest {
    @NotBlank(message = "Criteria text is required")
    @Size(max = 255, message = "Text is too long")
    @Schema(description = "Text description of the criterion", example = "Code quality")
    private String text;
}
