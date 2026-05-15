package com.project.backend.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "TeamLeaderboardResponse", description = "DTO representing a team on the leaderboard")
public class TeamLeaderboardResponse {

    @Schema(description = "ID of the team", example = "1")
    private Long id;

    @Schema(description = "Name of the team", example = "Coffee Programmers")
    private String name;

    @Schema(description = "Email of the team", example = "coffee.programmers@example.com")
    private String email;

    @Schema(description = "Count of members in the team", example = "3")
    private Long countOfMembers;

    @Schema(description = "Total points scored by the team", example = "95.5")
    private Double points;
}