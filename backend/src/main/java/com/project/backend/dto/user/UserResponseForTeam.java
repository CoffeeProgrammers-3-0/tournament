package com.project.backend.dto.user;

import com.project.backend.models.constants.TournamentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "UserResponseForTeam", description = "DTO representing a user in a team")
public class UserResponseForTeam {

    @Schema(description = "ID of the user", example = "1")
    private Long id;

    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;

    @Schema(description = "Email of the user", example = "john.doe@test-user.com")
    private String email;

    @Schema(description = "Indicates if the user is the team leader", example = "true")
    private Boolean isLeader;

    @Schema(description = "Id of a tournament", example = "1")
    private Long tournamentId;

    @Schema(description = "Name of the tournament", example = "CODE4FUTURE 2026")
    private String tournamentName;

    @Schema(description = "Status of the tournament", example = "RUNNING")
    private TournamentStatus tournamentStatus;

    @Schema(description = "Maximum size of the team", example = "5")
    private Integer tournamentMaxCountOfTeam;
}