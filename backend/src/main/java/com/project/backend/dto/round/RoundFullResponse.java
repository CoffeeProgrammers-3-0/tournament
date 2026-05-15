package com.project.backend.dto.round;

import com.project.backend.dto.tournament.TournamentListResponse;
import com.project.backend.models.constants.RoundStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "RoundFullResponse", description = "DTO representing full details of a round")
public class RoundFullResponse {

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

    @Schema(description = "Number of winners for the round", example = "15")
    private Long countOfWinners;

    @Schema(description = "Requirements for the round", example = "Backend/framework, database, deploy")
    private String requirements;

    @Schema(description = "Task description for the round", example = "Implement a REST API for a mini application")
    private String task;

    @Schema(description = "Status of the round", example = "ACTIVE")
    private RoundStatus status;

    @Schema(description = "Tournament of the round")
    private TournamentListResponse tournament;
}