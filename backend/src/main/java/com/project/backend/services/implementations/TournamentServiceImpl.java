package com.project.backend.services.implementations;

import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.services.interfaces.TournamentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;

    @Override
    public Tournament create(Tournament tournament) {
        // TODO
        return null;
    }

    @Override
    public Tournament update(Long tournamentId, Tournament tournament) {
        // TODO
        return null;
    }

    @Override
    public void delete(Long tournamentId) {
        // TODO
    }

    @Override
    public Page<Tournament> findAll(Integer page, Integer size, String search, TournamentStatus status) {
        // TODO
        return null;
    }

    @Override
    public Page<Tournament> findAllByUser(Integer page, Integer size, String search, TournamentStatus status, User me) {
        // TODO
        return null;
    }

    @Override
    public Page<Tournament> findAllByUserNot(Integer page, Integer size, String search, Object o, User me) {
        // TODO
        return null;
    }

    @Override
    public Tournament findById(Long tournamentId) {
        // TODO
        return null;
    }
}
