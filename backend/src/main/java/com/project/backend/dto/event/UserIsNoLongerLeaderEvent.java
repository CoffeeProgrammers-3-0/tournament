package com.project.backend.dto.event;

import com.project.backend.models.join_tables.TeamParticipant;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserIsNoLongerLeaderEvent {
    private TeamParticipant teamParticipant;
}
