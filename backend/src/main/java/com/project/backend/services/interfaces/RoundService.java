package com.project.backend.services.interfaces;

import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
import org.springframework.data.domain.Page;

public interface RoundService {
    Round create(Long tournamentId, Round round);

    Round update(Long roundId, Round round);

    void delete(Long roundId);

    Page<Round> findAllByTournament(Long tournamentId, Integer page, Integer size, String search, RoundStatus status);

    Round findById(Long roundId);

    void setJury(Long roundId, Long juryId);

    void removeJury(Long roundId, Long juryId);
}
