package com.project.backend.dto.roundEvent;

import com.project.backend.models.constants.RoundEventType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "RoundEventRequest", description = "DTO for creating and updating a round event")
public class RoundEventRequest {
    @NotNull(message = "Start date is required")
    @Schema(description = "Start date of the round in ISO format", example = "2026-04-01T10:00:00.000Z")
    private Instant startDate;

    @NotNull(message = "End date is required")
    @Schema(description = "End date of the round in ISO format", example = "2026-04-01T18:00:00.000Z")
    private Instant endDate;

    @NotNull
    @Schema(description = "Type of the event", example = "ONLINE")
    private RoundEventType type;

    @Schema(description = "Detailed description of the event", example = "Discussion of project requirements")
    private String description;

    @NotBlank
    @Size(max = 255)
    @Schema(description = "Title of the event", example = "Kickoff Meeting", maxLength = 255)
    private String title;

    @Size(max = 255)
    @Schema(description = "Location of the event", example = "Conference Room A", maxLength = 255)
    private String location;

    @Size(max = 512)
    @Schema(description = "Platform link (Zoom, Google Meet, etc.)", example = "https://meet.google.com/abc-defg-hij", maxLength = 512)
    private String platformUrl;
}