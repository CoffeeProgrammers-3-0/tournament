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
@Transactional(readOnly = true)
public class StatusSchedulerServiceImpl {

    private final TournamentRepository tournamentRepository;
    private final RoundRepository roundRepository;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateStatusesBasedOnTime() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Початок реєстрації
        int regsStarted = tournamentRepository.startRegistrations(now);
        if (regsStarted > 0) log.info("Opened registration for {} tournaments", regsStarted);

        // 2. Початок турнірів
        int toursStarted = tournamentRepository.startTournaments(now);
        if (toursStarted > 0) log.info("Started {} tournaments", toursStarted);

        // 3. Початок раундів
        int roundsStarted = roundRepository.startRounds(now);
        if (roundsStarted > 0) log.info("Started {} rounds", roundsStarted);

        // 4. Закриття прийому робіт у раундах
        int roundsClosed = roundRepository.closeRoundSubmissions(now);
        if (roundsClosed > 0) log.info("Closed submissions for {} rounds", roundsClosed);

        // 5. НОВА ЛОГІКА: Завершення турнірів
        // Це спрацює, коли останній раунд перейде в EVALUATED (це зазвичай робить адмін вручну)
        int toursFinished = tournamentRepository.finishTournaments();
        if (toursFinished > 0) log.info("Successfully finished {} tournaments", toursFinished);
    }
}