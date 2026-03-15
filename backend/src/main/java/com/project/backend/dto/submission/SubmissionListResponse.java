package com.project.backend.dto.submission;

import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.team.TeamListResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "SubmissionListResponse", description = "DTO for listing submissions with minimal info")
public class SubmissionListResponse {

    @Schema(description = "ID of the submission", example = "1")
    private Long id;

    @Schema(description = "Round associated with the submission")
    private RoundListResponse round;

    @Schema(description = "Team associated with the submission")
    private TeamListResponse team;
}
