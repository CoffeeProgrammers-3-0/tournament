package com.project.backend.services.implementations;

import com.project.backend.dto.event.*;
import com.project.backend.repositories.RoundEventRepository;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatusSchedulerServiceImpl {

    private final TournamentRepository tournamentRepository;
    private final RoundRepository roundRepository;
    private final RoundEventRepository roundEventRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void updateStatusesBasedOnTime() {
        Instant now = Instant.now();
        System.out.println("STARTING UPDATE STATUSES: " + now);
        List<Long> regsStarted = tournamentRepository.startRegistrationsAndReturnIds(now);
        if (!regsStarted.isEmpty()) {
            log.info("Opened registration for {} tournaments: {}", regsStarted.size(), regsStarted);

            regsStarted.forEach(id ->
                    eventPublisher.publishEvent(new TournamentRegistrationStartedEvent(id))
            );
        }

        List<Long> toursStarted = tournamentRepository.startTournamentsAndReturnIds(now);
        if (!toursStarted.isEmpty()) {
            log.info("Started {} tournaments: {}", toursStarted.size(), toursStarted);

            toursStarted.forEach(id ->
                    eventPublisher.publishEvent(new TournamentStartedEvent(id))
            );
        }

        List<Long> roundsStarted = roundRepository.startRoundsAndReturnIds(now);
        if (!roundsStarted.isEmpty()) {
            log.info("Started {} rounds: {}", roundsStarted.size(), roundsStarted);

            roundsStarted.forEach(id ->
                    eventPublisher.publishEvent(new RoundStartedEvent(id))
            );
        }

        List<Long> roundsClosed = roundRepository.closeRoundSubmissionsAndReturnIds(now);
        if (!roundsClosed.isEmpty()) {
            log.info("Closed submissions for {} rounds: {}", roundsClosed.size(), roundsClosed);

            roundsClosed.forEach(id ->
                    eventPublisher.publishEvent(new RoundSubmissionClosedEvent(id))
            );
        }

        List<Long> toursFinished = tournamentRepository.finishTournamentsAndReturnIds();
        if (!toursFinished.isEmpty()) {
            log.info("Successfully finished {} tournaments: {}", toursFinished.size(), toursFinished);

            toursFinished.forEach(id ->
                    eventPublisher.publishEvent(new TournamentFinishedEvent(id))
            );
        }
    }

    @Scheduled(cron = "0 0/5 * * * *")
    public void notifyDeadline24h() {
        Instant now = Instant.now().plus(30, ChronoUnit.SECONDS).truncatedTo(ChronoUnit.MINUTES);
        log.info("notifyDeadline24h: Scheduled task started at {}", now);

        Instant from = now.plus(24, ChronoUnit.HOURS);
        Instant to = from;
        from = from.minus(5, ChronoUnit.MINUTES);

        List<Long> rounds = roundRepository.findRoundsWithDeadlineBetween(from, to);

        if (!rounds.isEmpty()) {
            log.info("Sending 24h deadline notifications for rounds: {}", rounds);

            rounds.forEach(id ->
                    eventPublisher.publishEvent(new RoundDeadline24hEvent(id))
            );
        }
    }

    @Scheduled(cron = "0 0/5 * * * *")
    public void notifyEvent1h() {
        Instant now = Instant.now().plus(30, ChronoUnit.SECONDS).truncatedTo(ChronoUnit.MINUTES);
        log.info("notifyEvent1h: Scheduled task started at {}", now);

        Instant from = now.plus(1, ChronoUnit.HOURS);
        Instant to = from.plus(5, ChronoUnit.MINUTES);

        List<Long> events = roundEventRepository.findEventsWithStartDateBetween(from, to);

        if (!events.isEmpty()) {
            log.info("Sending 1h before event for events: {}", events);

            events.forEach(id ->
                    eventPublisher.publishEvent(new RoundEventBefore1hEvent(id))
            );
        }
    }
}