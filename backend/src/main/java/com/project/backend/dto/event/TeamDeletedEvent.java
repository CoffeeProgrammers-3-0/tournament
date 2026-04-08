package com.project.backend.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TeamDeletedEvent {
    private Long teamId;
    private List<Long> roundsWithATeam;
}