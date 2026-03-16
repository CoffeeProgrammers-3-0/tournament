package com.project.backend.dto.round;

import com.project.backend.models.constants.RoundStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "RoundListResponse", description = "DTO for listing rounds with minimal info")
public class RoundListResponse {

    @Schema(description = "ID of the round", example = "1")
    private Long id;

    @Schema(description = "Name of the round", example = "Offline Round")
    private String name;

    @Schema(description = "Start date of the round in ISO format", example = "2026-04-01T10:00:00")
    private String startDate;

    @Schema(description = "End date of the round in ISO format", example = "2026-04-10T18:00:00")
    private String endDate;

    @Schema(description = "Status of the round", example = "ACTIVE")
    private RoundStatus status;
}