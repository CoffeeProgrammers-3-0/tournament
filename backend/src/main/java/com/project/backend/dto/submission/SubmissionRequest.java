package com.project.backend.dto.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "SubmissionRequest", description = "DTO for creating or updating a submission")
public class SubmissionRequest {

    @Schema(description = "GitHub repository link of the submission", example = "https://github.com/user/project")
    private String githubLink;

    @Schema(description = "Video presentation link of the submission", example = "https://youtu.be/example")
    private String videoLink;

    @Schema(description = "Description of the submission", example = "This is a demo project implementing REST API")
    private String description;
}