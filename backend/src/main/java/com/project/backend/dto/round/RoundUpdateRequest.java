package com.project.backend.dto.round;

import com.project.backend.models.constants.RoundStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(name = "RoundUpdateRequest", description = "DTO for updating an existing round")
public class RoundUpdateRequest {

    @NotBlank(message = "Round name is required")
    @Size(max = 255, message = "Name is too long")
    @Schema(description = "Name of the round", example = "Offline Round")
    private String name;

    @NotBlank(message = "Start date is required")
    @Pattern(
            regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$",
            message = "Start date must be in ISO format (yyyy-MM-dd'T'HH:mm:ss)"
    )
    @Schema(description = "Start date of the round in ISO format", example = "2026-04-01T10:00:00")
    private String startDate;

    @NotBlank(message = "End date is required")
    @Pattern(
            regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$",
            message = "End date must be in ISO format (yyyy-MM-dd'T'HH:mm:ss)"
    )
    @Schema(description = "End date of the round in ISO format", example = "2026-04-10T18:00:00")
    private String endDate;

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

    @NotNull(message = "Status cannot be null if provided")
    @Schema(description = "Status of the round", example = "ACTIVE")
    private RoundStatus status;
}