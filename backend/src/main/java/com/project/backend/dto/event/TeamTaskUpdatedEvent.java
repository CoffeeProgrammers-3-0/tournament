package com.project.backend.dto.event;

import com.project.backend.models.TeamTask;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeamTaskUpdatedEvent {
    private TeamTask teamTask;
}
