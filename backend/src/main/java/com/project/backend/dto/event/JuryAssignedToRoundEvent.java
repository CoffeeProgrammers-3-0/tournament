package com.project.backend.dto.event;

import com.project.backend.models.join_tables.Jury;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JuryAssignedToRoundEvent {
    private Jury jury;
}
