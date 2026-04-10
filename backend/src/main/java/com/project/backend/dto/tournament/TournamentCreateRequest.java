package com.project.backend.dto.tournament;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(name = "TournamentCreateRequest", description = "DTO for creating a new tournament")
public class TournamentCreateRequest {

    @NotBlank(message = "Tournament name is required")
    @Size(max = 255, message = "Tournament name is too long")
    @Schema(description = "Name of the tournament", example = "CODE4FUTURE 2026")
    private String name;

    @Schema(description = "Description of the tournament", example = "A team tournament")
    private String description;

    @NotBlank(message = "Start date is required")
    @Pattern(
            regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$",
            message = "Start date must be in ISO format (yyyy-MM-dd'T'HH:mm:ss)"
    )
    @Schema(description = "Start date of the tournament in ISO format", example = "2026-05-01T10:00:00")
    private String startTournament;

    @NotBlank(message = "Start date of registration is required")
    @Pattern(
            regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$",
            message = "Start date of registration must be in ISO format (yyyy-MM-dd'T'HH:mm:ss)"
    )
    @Schema(description = "Start date of the registration in ISO format", example = "2026-04-01T10:00:00")
    private String startRegistration;

    @NotBlank(message = "End date of registration is required")
    @Pattern(
            regexp = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?$",
            message = "End date of registration must be in ISO format (yyyy-MM-dd'T'HH:mm:ss)"
    )
    @Schema(description = "End date of the registration in ISO format", example = "2026-04-20T18:00:00")
    private String endRegistration;

    @NotNull(message = "Maximum number of members in team is required")
    @Min(value = 3, message = "There must be at least 3 member in team")
    @Schema(description = "Maximum number of members in team allowed", example = "5")
    private Long maxCountOfTeam;

    @NotNull(message = "Number of rounds is required")
    @Min(value = 1, message = "There must be at least 1 round")
    @Schema(description = "Number of rounds in the tournament", example = "3")
    private Long countOfRounds;
}
