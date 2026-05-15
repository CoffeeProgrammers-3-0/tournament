package com.project.backend.dto.tournament;

import com.project.backend.models.constants.TournamentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "TournamentListResponse", description = "DTO for listing tournaments with minimal info")
public class TournamentListResponse {

    @Schema(description = "ID of the tournament", example = "1")
    private Long id;

    @Schema(description = "Name of the tournament", example = "CODE4FUTURE 2026")
    private String name;

    @Schema(description = "Start date of the tournament in ISO format", example = "2026-05-01T10:00:00.000Z")
    private Instant startTournament;

    @Schema(description = "Start date of the registration in ISO format", example = "2026-04-01T10:00:00.000Z")
    private Instant startRegistration;

    @Schema(description = "End date of the registration in ISO format", example = "2026-04-20T18:00:00.000Z")
    private Instant endRegistration;

    @Schema(description = "Current status of the tournament", example = "RUNNING")
    private TournamentStatus status;
}