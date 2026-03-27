package com.project.backend.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "TeamLeaderboardResponse", description = "DTO representing a team on the leaderboard")
public class TeamLeaderboardResponse {

    @Schema(description = "ID of the team", example = "1")
    private Long id;

    @Schema(description = "Name of the team", example = "Coffee Programmers")
    private String name;

    @Schema(description = "Email of the team", example = "coffee.programmers@example.com")
    private String email;

    @Schema(description = "Total points scored by the team", example = "95.5")
    private Double points;

    public TeamLeaderboardResponse(Long id, String name, String email, Double points) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.points = points;
    }

    public TeamLeaderboardResponse() {}
}