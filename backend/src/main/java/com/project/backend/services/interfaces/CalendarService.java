package com.project.backend.services.interfaces;

import com.project.backend.dto.calendar.CalendarEventDTO;

import java.time.Instant;
import java.util.List;

public interface CalendarService {
    List<CalendarEventDTO> getCalendar(
            Instant startDate,
            Instant endDate,
            Long userId,
            boolean showRegistration,
            boolean showRunning,
            boolean showRounds,
            boolean showOffline,
            boolean showOnline
    );
}
