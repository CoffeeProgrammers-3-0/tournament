package com.project.backend.listeners;

import com.project.backend.dto.event.RoundCreatedEvent;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.ids.TeamRoundId;
import com.project.backend.models.join_tables.TeamRound;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.repositories.TeamRoundRepository;
import com.project.backend.repositories.specifications.TeamSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoundListener {
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TeamRoundRepository teamRoundRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundCreatedEvent(RoundCreatedEvent event) {
        Round round = event.getRound();
        Tournament tournament = round.getTournament();

        List<Team> teams = teamRepository.findAll(TeamSpecification.byTournamentId(tournament.getId()));
        List<TeamRound> teamRounds = new ArrayList<>();

        for(Team team : teams) {
            TeamRoundId teamRoundId = new TeamRoundId();
            teamRoundId.setRoundId(round.getId());
            teamRoundId.setTeamId(team.getId());

            TeamRound teamRound = new TeamRound();
            teamRound.setId(teamRoundId);
            teamRound.setRound(round);
            teamRound.setTeam(team);

            teamRounds.add(teamRound);
        }

        teamRoundRepository.saveAll(teamRounds);
    }
}
