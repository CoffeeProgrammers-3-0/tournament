package com.project.backend.dto.tournament;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "TournamentCreateRequest", description = "DTO for creating a new tournament")
public class TournamentCreateRequest {

    @Schema(description = "Name of the tournament", example = "CODE4FUTURE 2026")
    private String name;

    @Schema(description = "Description of the tournament", example = "A team tournament")
    private String description;

    @Schema(description = "Start date of the tournament in ISO format", example = "2026-05-01T10:00:00")
    private String startTournament;

    @Schema(description = "Start date of the registration in ISO format", example = "2026-04-01T10:00:00")
    private String startRegistration;

    @Schema(description = "End date of the registration in ISO format", example = "2026-04-20T18:00:00")
    private String endRegistration;

    @Schema(description = "Maximum number of members in team allowed", example = "5")
    private Long maxCountOfTeam;

    @Schema(description = "Number of rounds in the tournament", example = "3")
    private Long countOfRounds;
}
