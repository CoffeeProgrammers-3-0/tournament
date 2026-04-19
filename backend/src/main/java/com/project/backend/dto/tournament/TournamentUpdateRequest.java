package com.project.backend.dto.tournament;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "TournamentUpdateRequest", description = "DTO for updating an existing tournament")
public class TournamentUpdateRequest {

    @NotBlank(message = "Tournament name is required")
    @Size(max = 255, message = "Tournament name is too long")
    @Schema(description = "Name of the tournament", example = "CODE4FUTURE 2026")
    private String name;

    @Schema(description = "Description of the tournament", example = "A team tournament")
    private String description;

    @NotNull(message = "Start date is required")
    @Schema(description = "Start date of the tournament in ISO format", example = "2026-05-01T10:00:00.000Z")
    private Instant startTournament;

    @NotNull(message = "Start date of registration is required")
    @Schema(description = "Start date of the registration in ISO format", example = "2026-04-01T10:00:00.000Z")
    private Instant startRegistration;

    @NotNull(message = "End date of registration is required")
    @Schema(description = "End date of the registration in ISO format", example = "2026-04-20T18:00:00.000Z")
    private Instant endRegistration;

    @NotNull(message = "Maximum number of members in team is required")
    @Min(value = 1, message = "There must be at least 1 member in team")
    @Schema(description = "Maximum number of members in team allowed", example = "5")
    private Long maxCountOfTeam;

    @NotNull(message = "Number of rounds is required")
    @Min(value = 1, message = "There must be at least 1 round")
    @Schema(description = "Number of rounds in the tournament", example = "3")
    private Long countOfRounds;
}