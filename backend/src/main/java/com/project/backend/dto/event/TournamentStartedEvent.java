package com.project.backend.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TournamentStartedEvent {
    private Long id;
}
