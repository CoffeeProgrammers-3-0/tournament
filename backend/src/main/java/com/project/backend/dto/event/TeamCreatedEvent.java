package com.project.backend.dto.event;

import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeamCreatedEvent {
    private Team team;
    private Tournament tournament;
}
