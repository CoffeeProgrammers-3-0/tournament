package com.project.backend.services.implementations;

import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.repositories.specifications.TournamentSpecification;
import com.project.backend.services.interfaces.TournamentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;

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

        tournament.setStatus(TournamentStatus.DRAFT);
        return tournamentRepository.save(tournament);
    }

    @Override
    @Transactional
    public Tournament update(Long tournamentId, Tournament tournament) {
        if (tournament.getMaxCountOfTeam() <= 0) {
            throw new IllegalArgumentException("Max count of teams must be positive");
        }

        if (tournament.getCountOfRounds() <= 0) {
            throw new IllegalArgumentException("Count of rounds must be positive");
        }

        Tournament tournamentToUpdate = findById(tournamentId);

        if (tournamentToUpdate.getStatus() != TournamentStatus.DRAFT) {
            throw new IllegalStateException("Only tournaments in DRAFT status can be updated");
        }

        tournamentToUpdate.setName(tournament.getName());
        tournamentToUpdate.setDescription(tournament.getDescription());
        tournamentToUpdate.setStartTournament(tournament.getStartTournament());
        tournamentToUpdate.setStartRegistration(tournament.getStartRegistration());
        tournamentToUpdate.setEndRegistration(tournament.getEndRegistration());
        tournamentToUpdate.setMaxCountOfTeam(tournament.getMaxCountOfTeam());
        tournamentToUpdate.setCountOfRounds(tournament.getCountOfRounds());
        tournamentToUpdate.setStatus(tournament.getStatus());
        return tournamentRepository.save(tournamentToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long tournamentId) {
        Tournament tournament = findById(tournamentId);

        if (tournament.getStatus() != TournamentStatus.DRAFT) {
            throw new IllegalStateException("Only tournaments in DRAFT or CANCELLED status can be deleted");
        }

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
}
