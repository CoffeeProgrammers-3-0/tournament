package com.project.backend.dto.event;

import com.project.backend.models.TeamTask;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class TeamTaskCreatedEvent {
    private TeamTask teamTask;
}
