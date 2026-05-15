package com.project.backend.services.interfaces;

import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.TeamLeaderboardResponse;

import java.io.IOException;
import java.util.List;

public interface ExcelExportService {
    byte[] exportToExcel(List<TeamLeaderboardResponse> leaderboard, List<StatisticResponse> statisticResponses) throws IOException;
}
