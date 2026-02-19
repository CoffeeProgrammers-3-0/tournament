package com.project.backend.dto.team;

import lombok.Data;

@Data
public class TeamLeaderboardResponse {
    private Long id;
    private String name;
    private String email;
    private Double points;
}