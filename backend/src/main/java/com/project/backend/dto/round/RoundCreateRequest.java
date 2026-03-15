package com.project.backend.dto.round;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "RoundCreateRequest", description = "DTO for creating a new round")
public class RoundCreateRequest {

    @Schema(description = "Name of the round", example = "Offline Round")
    private String name;

    @Schema(description = "Start date of the round in ISO format", example = "2026-04-01T10:00:00")
    private String startDate;

    @Schema(description = "End date of the round in ISO format", example = "2026-04-10T18:00:00")
    private String endDate;

    @Schema(description = "Number of winners for the round", example = "15")
    private Long countOfWinners;

    @Schema(description = "Requirements for the round", example = "Backend/framework, database, deploy")
    private String requirements;

    @Schema(description = "Task description for the round", example = "Implement a REST API for a mini application")
    private String task;
}