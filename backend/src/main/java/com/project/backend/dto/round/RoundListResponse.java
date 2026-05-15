package com.project.backend.dto.round;

import com.project.backend.models.constants.RoundStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "RoundListResponse", description = "DTO for listing rounds with minimal info")
public class RoundListResponse {

    @Schema(description = "ID of the round", example = "1")
    private Long id;

    @Schema(description = "Name of the round", example = "Offline Round")
    private String name;

    @Schema(
            description = "Start date of the round in ISO UTC format",
            example = "2026-04-18T21:00:00.000Z"
    )
    private Instant startDate;

    @Schema(
            description = "End date of the round in ISO UTC format",
            example = "2026-04-19T20:59:00.000Z"
    )
    private Instant endDate;

    @Schema(description = "Status of the round", example = "ACTIVE")
    private RoundStatus status;
}