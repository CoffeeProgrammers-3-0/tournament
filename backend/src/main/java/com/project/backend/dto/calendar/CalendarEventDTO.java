package com.project.backend.dto.calendar;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "CalendarEventDTO", description = "DTO representing an event in the calendar (tournament or round/roundEvent)")
public class CalendarEventDTO {

    @Schema(description = "Unique identifier of the event", example = "101")
    private Long id;

    @Schema(description = "Name of the event (e.g., Tournament name or Round title)", example = "Spring Coding Cup 2026")
    private String name;

    @Schema(description = "Start date and time of the event", example = "2026-04-20T10:00:00Z")
    private Instant startDate;

    @Schema(description = "End date and time of the event", example = "2026-04-20T18:00:00Z")
    private Instant endDate;

    @Schema(description = "Type of the calendar event", example = "TOURNAMENT_RUNNING")
    private CalendarEventType type;
}