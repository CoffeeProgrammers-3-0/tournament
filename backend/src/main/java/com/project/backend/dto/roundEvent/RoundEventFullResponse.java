package com.project.backend.dto.roundEvent;

import com.project.backend.dto.user.UserResponse;
import com.project.backend.models.constants.RoundEventType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "RoundEventFullResponse", description = "DTO representing full details of a round")
public class RoundEventFullResponse {
    @Schema(description = "ID of the round event", example = "1")
    private Long id;

    @Schema(description = "Start date of the round in ISO format", example = "2026-04-01T10:00:00.000Z")
    private Instant startDate;

    @Schema(description = "End date of the round in ISO format", example = "2026-04-01T18:00:00.000Z")
    private Instant endDate;

    @Schema(description = "Type of the event", example = "OFFLINE")
    private RoundEventType type;

    @Schema(description = "Detailed description of the event", example = "Technical interview with HR and Lead Developer")
    private String description;

    @Schema(description = "Title of the event", example = "Technical Interview Phase 1")
    private String title;

    @Schema(description = "Physical location or meeting room", example = "Office 404, London")
    private String location;

    @Schema(description = "URL for online meetings", example = "https://zoom.us/j/123456789")
    private String platformUrl;

    @Schema(description = "User who created the event")
    private UserResponse creator;
}
