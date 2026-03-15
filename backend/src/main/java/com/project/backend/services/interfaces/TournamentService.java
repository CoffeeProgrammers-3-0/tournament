package com.project.backend.services.interfaces;

import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.TournamentStatus;
import org.springframework.data.domain.Page;

public interface TournamentService {
    Tournament create(Tournament tournament);

    Tournament update(Long tournamentId, Tournament tournament);

    void delete(Long tournamentId);

    Page<Tournament> findAll(Integer page, Integer size, String search, TournamentStatus status);

    Page<Tournament> findAllByUser(Integer page, Integer size, String search, TournamentStatus status, User user);

    Page<Tournament> findAllByUserNot(Integer page, Integer size, String search, TournamentStatus status, User user);

    Tournament findById(Long tournamentId);
}
