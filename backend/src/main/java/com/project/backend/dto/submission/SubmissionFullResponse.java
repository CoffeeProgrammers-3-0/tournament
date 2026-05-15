package com.project.backend.dto.submission;

import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.team.TeamListResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "SubmissionFullResponse", description = "DTO representing full details of a submission")
public class SubmissionFullResponse {

    @Schema(description = "ID of the submission", example = "1")
    private Long id;

    @Schema(description = "GitHub repository link of the submission", example = "https://github.com/user/project")
    private String githubLink;

    @Schema(description = "Video presentation link of the submission", example = "https://youtu.be/example")
    private String videoLink;

    @Schema(description = "Description of the submission", example = "This is a demo project implementing REST API")
    private String description;

    @Schema(description = "Round associated with the submission")
    private RoundListResponse round;

    @Schema(description = "Team associated with the submission")
    private TeamListResponse team;
}