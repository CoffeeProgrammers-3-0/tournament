package com.project.backend.services.interfaces;

import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface RoundService {
    Round create(Long tournamentId, Round round);

    Round update(Long roundId, Round round);

    void delete(Long roundId);

    Page<Round> findAllByTournament(Long tournamentId, Integer page, Integer size, String search, RoundStatus status);

    Page<Round> findAllByRoundInSameTournament(Long roundId, Integer page, Integer size, String search, RoundStatus status);

    Round findById(Long roundId);

    void setJury(Long roundId, Long juryId);

    void removeJury(Long roundId, Long juryId);

    void assignTeams(Long roundId, List<Long> teamIds);

    void unassignTeams(Long roundId, List<Long> teamIds);

    void assignAllTeams(Long roundId);

    void unassignAllTeams(Long roundId);

    void startRound(Long roundId);

    void closeSubmissions(Long roundId);

    void evaluate(Long roundId);

    void rollbackCloseSubmissions(Long roundId);

    void rollbackStartRound(Long roundId);

    void draft(Long roundId);
}
