package com.project.backend.dto.event;

import com.project.backend.models.join_tables.JurySubmission;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class JurySubmissionCreatedEvent {
    private JurySubmission jurySubmission;
}
