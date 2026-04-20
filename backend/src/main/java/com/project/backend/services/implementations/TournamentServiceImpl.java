package com.project.backend.services.implementations;

import com.project.backend.dto.event.TournamentFinishedEvent;
import com.project.backend.dto.event.TournamentRegistrationStartedEvent;
import com.project.backend.dto.event.TournamentStartedEvent;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.repositories.specifications.TournamentSpecification;
import com.project.backend.services.interfaces.TournamentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;
    private final RoundRepository roundRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Tournament create(Tournament tournament) {
        if (tournament.getStartRegistration() != null && tournament.getEndRegistration() != null
                && tournament.getStartRegistration().isAfter(tournament.getEndRegistration())) {
            throw new IllegalArgumentException("Start of registration must be before end of registration");
        }

        if (tournament.getStartTournament() != null && tournament.getEndRegistration() != null
                && tournament.getStartTournament().isBefore(tournament.getEndRegistration())) {
            throw new IllegalArgumentException("Tournament cannot start before registration ends");
        }

        if (tournament.getMaxCountOfTeam() <= 3) {
            throw new IllegalArgumentException("Max size of team can not be less than 3");
        }

        if (tournament.getCountOfRounds() <= 1) {
            throw new IllegalArgumentException("Count of rounds can not be less than 1");
        }

        tournament.setStatus(TournamentStatus.DRAFT);
        return tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public Tournament update(Long tournamentId, Tournament tournament) {
        if (tournament.getMaxCountOfTeam() <= 3) {
            throw new IllegalArgumentException("Max size of team can not be less than 3");
        }

        if (tournament.getCountOfRounds() <= 1) {
            throw new IllegalArgumentException("Count of rounds can not be less than 1");
        }

        Tournament tournamentToUpdate = findByIdAdmin(tournamentId);
        tournamentToUpdate.setName(tournament.getName());
        tournamentToUpdate.setDescription(tournament.getDescription());
        tournamentToUpdate.setStartTournament(tournament.getStartTournament());
        tournamentToUpdate.setStartRegistration(tournament.getStartRegistration());
        tournamentToUpdate.setEndRegistration(tournament.getEndRegistration());
        tournamentToUpdate.setMaxCountOfTeam(tournament.getMaxCountOfTeam());
        tournamentToUpdate.setCountOfRounds(tournament.getCountOfRounds());
        return tournamentRepository.save(tournamentToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if (!tournament.getTeamParticipants().isEmpty()) {
            throw new IllegalStateException("Cannot delete tournament because there are already registered teams");
        }

        tournamentRepository.delete(tournament);
    }

    @Override
    public Page<Tournament> findAll(Integer page, Integer size, String search, TournamentStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startRegistration"));
        return tournamentRepository.findAll(Specification.allOf(TournamentSpecification.byName(search), TournamentSpecification.byTournamentStatus(status)), pageRequest);
    }

    @Override
    public Page<Tournament> findAllByUser(Integer page, Integer size, String search, TournamentStatus status, User user) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startRegistration", "name"));
        return tournamentRepository.findAll(Specification.allOf(TournamentSpecification.byName(search), TournamentSpecification.byTournamentStatus(status), TournamentSpecification.byUserId(user.getId())), pageRequest);
    }

    @Override
    public Page<Tournament> findAllByUserNot(Integer page, Integer size, String search, TournamentStatus status, User user) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startRegistration", "name"));
        return tournamentRepository.findAll(Specification.allOf(
                        TournamentSpecification.byName(search),
                        TournamentSpecification.byTournamentStatus(status),
                        TournamentSpecification.byUserIdNot(user.getId())),
                pageRequest);
    }

    @Override
    public Tournament findById(Long tournamentId) {
        return tournamentRepository.findOne(
                Specification.allOf(
                        Specification.not(
                                TournamentSpecification.byTournamentStatus(TournamentStatus.DRAFT)
                        ),
                        TournamentSpecification.byId(tournamentId)
                )
        ).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));
    }

    @Override
    public Tournament findByIdAdmin(Long tournamentId) {
        return tournamentRepository.findById(tournamentId).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));
    }

    @Override
    @Transactional
    public void startRegistration(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if(tournament.getStatus() != TournamentStatus.DRAFT) {
            throw new IllegalStateException("Only tournament with DRAFT status can be set to REGISTRATION");
        }

        tournament.setStatus(TournamentStatus.REGISTRATION);
        tournament.setStartRegistration(Instant.now());

        tournamentRepository.save(tournament);

        TournamentRegistrationStartedEvent event = new TournamentRegistrationStartedEvent(tournamentId);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void startTournament(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if(tournament.getStatus() != TournamentStatus.REGISTRATION) {
            throw new IllegalStateException("Only tournament with REGISTRATION status can be set to RUNNING");
        }

        tournament.setStatus(TournamentStatus.RUNNING);
        tournament.setEndRegistration(Instant.now());
        tournament.setStartTournament(tournament.getEndRegistration());

        tournamentRepository.save(tournament);

        TournamentStartedEvent event = new TournamentStartedEvent(tournamentId);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void finish(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if(tournament.getStatus() != TournamentStatus.RUNNING) {
            throw new IllegalStateException("Only tournament with RUNNING status can be set to FINISHED");
        }
        if(roundRepository.existsByTournamentIdAndStatuses(tournamentId, List.of(RoundStatus.ACTIVE, RoundStatus.SUBMISSION_CLOSED))) {
            throw new IllegalStateException("Can not finish round that has ACTIVE or SUBMISSION_CLOSED rounds");
        }

        tournament.setStatus(TournamentStatus.FINISHED);
        tournamentRepository.save(tournament);

        TournamentFinishedEvent event = new TournamentFinishedEvent(tournamentId);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void rollbackFinishTournament(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if(tournament.getStatus() != TournamentStatus.FINISHED) {
            throw new IllegalStateException("Only tournament with FINISHED status can be rolled back to RUNNING");
        }

        tournament.setStatus(TournamentStatus.RUNNING);
        tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public void rollbackStartTournament(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if(tournament.getStatus() != TournamentStatus.RUNNING) {
            throw new IllegalStateException("Only tournament with RUNNING status can be rolled back to REGISTRATION");
        }

        tournament.setStatus(TournamentStatus.REGISTRATION);
        tournament.setEndRegistration(Instant.now().plus(1, ChronoUnit.DAYS));
        tournament.setStartTournament(tournament.getEndRegistration());
        tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public void draft(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if(tournament.getStatus() != TournamentStatus.REGISTRATION) {
            throw new IllegalStateException("Only tournament with REGISTRATION status can be rolled back to DRAFT");
        }

        if(roundRepository.existsByTournamentIdAndStatuses(tournamentId, List.of(RoundStatus.ACTIVE, RoundStatus.SUBMISSION_CLOSED, RoundStatus.EVALUATED))) {
            throw new IllegalStateException("Tournaments that have any other round rather then draft round can not be drafted");
        }

        tournament.setStatus(TournamentStatus.DRAFT);
        tournament.setStartRegistration(Instant.now().plus(1, ChronoUnit.DAYS));
        if(tournament.getEndRegistration().isBefore(tournament.getStartRegistration())) {
            tournament.setEndRegistration(tournament.getStartRegistration().plus(1, ChronoUnit.DAYS));
            tournament.setStartTournament(tournament.getEndRegistration());
        }
        tournamentRepository.save(tournament);
    }
}
