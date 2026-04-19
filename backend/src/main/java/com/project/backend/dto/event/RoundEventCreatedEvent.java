package com.project.backend.dto.event;

import com.project.backend.models.RoundEvent;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class RoundEventCreatedEvent {
    private RoundEvent roundEvent;
}
