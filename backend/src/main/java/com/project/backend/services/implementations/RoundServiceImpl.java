package com.project.backend.services.implementations;

import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.services.interfaces.RoundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoundServiceImpl implements RoundService {
    private final RoundRepository roundRepository;
    private final TournamentRepository tournamentRepository;

    @Override
    public Round create(Long tournamentId, Round round) {
        // TODO
        return null;
    }

    @Override
    public Round update(Long roundId, Round round) {
        // TODO
        return null;
    }

    @Override
    public void delete(Long roundId) {
        // TODO
    }

    @Override
    public Page<Round> findAllByTournament(Long tournamentId, Integer page, Integer size, String search, RoundStatus status) {
        // TODO
        return null;
    }

    @Override
    public Round findById(Long roundId) {
        // TODO
        return null;
    }

    @Override
    public void setJury(Long roundId, Long juryId) {
        // TODO
    }
}
