package com.project.backend.services.implementations;

import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatusSchedulerServiceImpl {

    private final TournamentRepository tournamentRepository;
    private final RoundRepository roundRepository;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateStatusesBasedOnTime() {
        LocalDateTime now = LocalDateTime.now();

        int regsStarted = tournamentRepository.startRegistrations(now);
        if (regsStarted > 0) log.info("Opened registration for {} tournaments", regsStarted);

        int toursStarted = tournamentRepository.startTournaments(now);
        if (toursStarted > 0) log.info("Started {} tournaments", toursStarted);

        int roundsStarted = roundRepository.startRounds(now);
        if (roundsStarted > 0) log.info("Started {} rounds", roundsStarted);

        int roundsClosed = roundRepository.closeRoundSubmissions(now);
        if (roundsClosed > 0) log.info("Closed submissions for {} rounds", roundsClosed);
    }
}