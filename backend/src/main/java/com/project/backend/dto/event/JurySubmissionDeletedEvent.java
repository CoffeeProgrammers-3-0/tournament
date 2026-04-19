package com.project.backend.dto.event;

import com.project.backend.models.Submission;
import com.project.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JurySubmissionDeletedEvent {
    private User jury;
    private Submission submission;
}
