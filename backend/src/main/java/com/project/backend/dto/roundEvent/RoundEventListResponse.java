package com.project.backend.dto.roundEvent;

import com.project.backend.dto.user.UserResponse;
import com.project.backend.models.constants.RoundEventType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "RoundEventListResponse", description = "DTO for listing round events with minimal info")
public class RoundEventListResponse {
    @Schema(description = "ID of the round event", example = "1")
    private Long id;

    @Schema(description = "Start date of the round in ISO format", example = "2026-04-01T10:00:00")
    private String startDate;

    @Schema(description = "End date of the round in ISO format", example = "2026-04-01T18:00:00")
    private String endDate;

    @Schema(description = "Type of the event", example = "OFFLINE")
    private RoundEventType type;

    @Schema(description = "Title of the event", example = "English Proficiency Test")
    private String title;

    @Schema(description = "User who created the event")
    private UserResponse creator;
}