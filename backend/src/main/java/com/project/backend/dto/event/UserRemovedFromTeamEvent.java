package com.project.backend.dto.event;

import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRemovedFromTeamEvent {
    private Team team;
    private User user;
    private Tournament tournament;
}
