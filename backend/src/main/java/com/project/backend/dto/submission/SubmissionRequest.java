package com.project.backend.dto.submission;

import lombok.Data;

@Data
public class SubmissionRequest {
    private String githubLink;
    private String youtubeLink;
    private String description;
}
