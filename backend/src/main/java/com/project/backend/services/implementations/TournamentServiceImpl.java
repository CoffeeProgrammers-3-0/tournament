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

@Service
@RequiredArgsConstructor
@Slf4j
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;

    @Override
    public Tournament create(Tournament tournament) {
        tournament.setStatus(TournamentStatus.DRAFT);
        return tournamentRepository.save(tournament);
    }

    @Override
    public Tournament update(Long tournamentId, Tournament tournament) {
        Tournament tournamentToUpdate = findById(tournamentId);
        tournamentToUpdate.setName(tournament.getName());
        tournamentToUpdate.setDescription(tournament.getDescription());
        tournamentToUpdate.setStartTournament(tournament.getStartTournament());
        tournamentToUpdate.setStartRegistration(tournament.getStartRegistration());
        tournamentToUpdate.setEndRegistration(tournament.getEndRegistration());
        tournamentToUpdate.setMaxCountOfTeam(tournament.getMaxCountOfTeam());
        tournamentToUpdate.setCountOfRounds(tournament.getCountOfRounds());
        tournamentToUpdate.setStatus(tournament.getStatus());
        return tournamentRepository.save(tournament);
    }

    @Override
    public void delete(Long tournamentId) {
        Tournament tournament = findById(tournamentId);
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
                        Specification
                                .not(TournamentSpecification.byUserId(user.getId()))
                        ), pageRequest);
    }

    @Override
    public Tournament findById(Long tournamentId) {
        return tournamentRepository.findById(tournamentId).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));
    }
}
