package com.project.backend.dto.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
@Schema(name = "SubmissionRequest", description = "DTO for creating or updating a submission")
public class SubmissionRequest {

    @NotBlank(message = "GitHub link is required")
    @Pattern(
            regexp = "^https?://(www\\.)?github\\.com/[\\w-]+/[\\w.-]+/?$",
            message = "Must be a valid GitHub repository link (e.g., https://github.com/user/repo)"
    )
    @Schema(description = "GitHub repository link of the submission", example = "https://github.com/user/project")
    private String githubLink;

    @NotBlank(message = "Video link is required")
    @URL(message = "Must be a valid URL")
    @Schema(description = "Video presentation link of the submission", example = "https://youtu.be/example")
    private String videoLink;

    @NotBlank(message = "Description is required")
    @Schema(description = "Description of the submission", example = "This is a demo project implementing REST API")
    private String description;
}