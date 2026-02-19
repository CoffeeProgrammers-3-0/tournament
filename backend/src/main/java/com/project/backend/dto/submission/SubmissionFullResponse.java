package com.project.backend.dto.submission;

import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.team.TeamListResponse;
import lombok.Data;

@Data
public class SubmissionFullResponse {
    private Long id;
    private String githubLink;
    private String youtubeLink;
    private String description;
    private RoundListResponse round;
    private TeamListResponse team;
}
