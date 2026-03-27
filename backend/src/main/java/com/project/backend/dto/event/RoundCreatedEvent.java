package com.project.backend.dto.event;

import com.project.backend.models.Round;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoundCreatedEvent {
    private Round round;
}
