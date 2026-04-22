package com.project.backend.dto.juryCriteria;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
@Schema(name = "JuryCriteriaRequest", description = "DTO for jury evaluating criterion")
public class JuryCriteriaRequest {
    @Max(value = 100, message = "Maximum amount is 100")
    @Min(value = 0, message = "Minimum amount is 0")
    @Schema(description = "Points awarded for this criterion", example = "100")
    private Long points;

    @Schema(description = "Status indicating if the jsc is additional or not", example = "false")
    private boolean additional;

    @Schema(description = "Comment by jury", example = "Good")
    private String comment;
}
