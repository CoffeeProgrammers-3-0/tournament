package com.project.backend.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PointsChangedForTeamEvent {
    private Long teamId;
    private Long roundId;
}
