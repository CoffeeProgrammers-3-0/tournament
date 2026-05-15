package com.project.backend.dto.event;

import com.project.backend.models.adminMessages.GlobalAdminMessage;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GlobalAdminMessageCreatedEvent {
    private GlobalAdminMessage globalAdminMessage;
}
