package com.project.backend.dto.event;

import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeamTaskDeletedEvent {
    private Team team;
    private Round round;
    private User assignee;
    private String title;
}
