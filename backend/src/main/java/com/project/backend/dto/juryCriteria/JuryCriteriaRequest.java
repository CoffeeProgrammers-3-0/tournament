package com.project.backend.dto.juryCriteria;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(name = "JuryCriteriaRequest", description = "DTO for jury evaluating criterion")
public class JuryCriteriaRequest {
    @Schema(description = "Id of the jsc", example = "32")
    private Long id;

    @NotNull
    @Schema(description = "Id of the submission", example = "12")
    private Long submissionId;

    @Schema(description = "Id of the criterion", example = "1")
    private Long criteriaId;

    @Max(value = 100, message = "Maximum amount is 100")
    @Min(value = 0, message = "Minimum amount is 0")
    @Schema(description = "Points awarded for this criterion", example = "100")
    private Long points;

    @Schema(description = "Status indicating if the jsc is additional or not", example = "false")
    private boolean additional;

    @Schema(description = "Comment by jury", example = "Good")
    private String comment;
}
