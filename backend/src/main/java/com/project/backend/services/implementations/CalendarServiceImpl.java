package com.project.backend.services.implementations;

import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.calendar.CalendarEventDTO;
import com.project.backend.repositories.RoundEventRepository;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.services.interfaces.CalendarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CalendarServiceImpl implements CalendarService {
    private final TournamentRepository tournamentRepository;
    private final RoundRepository roundRepository;
    private final RoundEventRepository roundEventRepository;

    @Override
    public List<CalendarEventDTO> getCalendar(
            Instant startDate,
            Instant endDate,
            Long userId,
            boolean showRegistration,
            boolean showRunning,
            boolean showRounds,
            boolean showOffline,
            boolean showOnline) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("startDate cannot be after endDate");
        }

        boolean isAdmin = SecurityUtil.isAdmin();
        Long targetUserId = isAdmin ? null : userId;

        List<CalendarEventDTO> response = new ArrayList<>();

        if (showRegistration) {
            response.addAll(tournamentRepository.findRegistrationEvents(startDate, endDate));
        }

        if (targetUserId == null && !isAdmin) {
            return response;
        }

        if (showRunning) {
            response.addAll(tournamentRepository.findPersonalTournamentEvents(startDate, endDate, targetUserId));
        }

        if (showRounds) {
            response.addAll(roundRepository.findPersonalRoundEvents(startDate, endDate, targetUserId));
        }

        if (showOffline || showOnline) {
            response.addAll(roundEventRepository.findPersonalRoundEventsWithFilters(
                    startDate, endDate, targetUserId, showOffline, showOnline));
        }

        return response;
    }
}
