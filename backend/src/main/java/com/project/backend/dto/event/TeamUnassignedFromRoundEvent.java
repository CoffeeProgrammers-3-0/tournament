package com.project.backend.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeamUnassignedFromRoundEvent {
    private Long teamId;
    private Long roundId;
}
