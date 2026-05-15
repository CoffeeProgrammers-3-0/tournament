package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.calendar.CalendarEventDTO;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/calendar")
@Tag(name = "Calendar", description = "API for getting calendar data for user")
public class CalendarController {
    private final CalendarService calendarService;
    private final CurrentUserContainer currentUserContainer;

    @GetMapping
    @Operation(
            summary = "Get calendar events",
            description = "Returns a list of events (tournaments, rounds/roundEvents) within a specified time range, filtered by user participation and event types."
    )
    public List<CalendarEventDTO> getCalendar(
            @Parameter(description = "Start of the time range", example = "2026-04-01T00:00:00Z")
            @RequestParam(value = "start_date") Instant startDate,

            @Parameter(description = "End of the time range", example = "2026-04-30T23:59:59Z")
            @RequestParam(value = "end_date") Instant endDate,

            @Parameter(description = "Whether to show tournament registration periods")
            @RequestParam(value = "show_reg", required = false, defaultValue = "true") boolean showRegistration,

            @Parameter(description = "Whether to show running tournaments")
            @RequestParam(value = "show_running", required = false, defaultValue = "true") boolean showRunning,

            @Parameter(description = "Whether to show specific rounds")
            @RequestParam(value = "show_rounds", required = false, defaultValue = "true") boolean showRounds,

            @Parameter(description = "Whether to show offline events")
            @RequestParam(value = "show_offline", required = false, defaultValue = "true") boolean showOffline,

            @Parameter(description = "Whether to show online events")
            @RequestParam(value = "show_online", required = false, defaultValue = "true") boolean showOnline
    ) {
        User user = currentUserContainer.getUser();
        log.debug("Fetching calendar for user: {}, range: {} to {}",
                user != null ? user.getEmail() : "Anonymous", startDate, endDate);

        return calendarService.getCalendar(
                startDate,
                endDate,
                user == null ? null : user.getId(),
                showRegistration,
                showRunning,
                showRounds,
                showOffline,
                showOnline
        );
    }
}