package com.project.backend.dto.leaderboard;

import com.project.backend.dto.team.TeamLeaderboardResponse;
import lombok.Data;

import java.util.List;

@Data
public class LeaderboardResponse {
    private Long maxPoints;
    private List<TeamLeaderboardResponse> leaderboard;
}
