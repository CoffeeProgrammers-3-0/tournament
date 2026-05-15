package com.project.backend.dto.event;

import com.project.backend.models.adminMessages.RoundAdminMessage;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoundAdminMessageCreatedEvent {
    private RoundAdminMessage roundAdminMessage;
}

