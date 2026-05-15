package com.project.backend.dto.criteria;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "CriteriaResponse", description = "DTO representing a single evaluation criterion")
public class CriteriaResponse {

    @Schema(description = "ID of the criterion", example = "1")
    private Long id;

    @Schema(description = "Text description of the criterion", example = "Code quality")
    private String text;
}
