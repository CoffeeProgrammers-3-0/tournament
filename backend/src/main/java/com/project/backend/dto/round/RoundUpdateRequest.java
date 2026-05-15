package com.project.backend.dto.round;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "RoundUpdateRequest", description = "DTO for updating an existing round")
public class RoundUpdateRequest {

    @NotBlank(message = "Round name is required")
    @Size(max = 255, message = "Name is too long")
    @Schema(description = "Name of the round", example = "Offline Round")
    private String name;

    @NotNull(message = "Start date is required")
    @Schema(
            description = "Start date of the round in full ISO UTC format",
            example = "2026-04-18T21:00:00.000Z"
    )
    private Instant startDate;

    @NotNull(message = "End date is required")
    @Schema(
            description = "End date of the round in full ISO UTC format",
            example = "2026-04-19T20:59:00.000Z"
    )
    private Instant endDate;

    @NotNull(message = "Count of winners is required")
    @Min(value = 1, message = "There must be at least 1 winner")
    @Schema(description = "Number of winners for the round", example = "15")
    private Long countOfWinners;

    @NotBlank(message = "Requirements are required")
    @Schema(description = "Requirements for the round", example = "Backend/framework, database, deploy")
    private String requirements;

    @NotBlank(message = "Task description is required")
    @Schema(description = "Task description for the round", example = "Implement a REST API for a mini application")
    private String task;
}