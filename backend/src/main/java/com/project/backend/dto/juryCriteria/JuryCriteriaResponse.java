package com.project.backend.dto.juryCriteria;

import com.project.backend.dto.criteria.CriteriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "JuryCriteriaResponse", description = "DTO representing a jury's evaluation of a criterion")
public class JuryCriteriaResponse {

    @Schema(description = "ID of the jury submission", example = "1")
    private Long jurySubmissionId;

    @Schema(description = "Criterion being evaluated")
    private CriteriaResponse criteria;

    @Schema(description = "Points awarded for this criterion", example = "100")
    private Long points;

    @Schema(description = "Status indicating if the jsc is additional or not", example = "false")
    private boolean additional;

    @Schema(description = "Comment by jury", example = "Good")
    private String comment;
}
