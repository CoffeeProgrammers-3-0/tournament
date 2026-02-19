package com.project.backend.dto.submission;

import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.team.TeamListResponse;
import lombok.Data;

@Data
public class SubmissionListResponse {
    private Long id;
    private RoundListResponse round;
    private TeamListResponse team;
}
