package com.project.backend.services.interfaces;

import com.project.backend.dto.team.TeamLeaderboardResponse;

import java.io.IOException;
import java.util.List;

public interface ExcelExportService {
    byte[] exportToExcel(List<TeamLeaderboardResponse> leaderboard) throws IOException;
}
