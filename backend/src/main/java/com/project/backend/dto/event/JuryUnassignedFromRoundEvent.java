package com.project.backend.dto.event;

import com.project.backend.models.Round;
import com.project.backend.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JuryUnassignedFromRoundEvent {
    private User user;
    private Round round;
}
