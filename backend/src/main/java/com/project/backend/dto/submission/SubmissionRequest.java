package com.project.backend.dto.submission;

import lombok.Data;

@Data
public class SubmissionRequest {
    private String githubLink;
    private String videoLink;
    private String description;
}
