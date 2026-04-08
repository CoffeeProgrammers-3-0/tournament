package com.project.backend.listeners;

import com.project.backend.dto.event.RoundCreatedEvent;
import com.project.backend.dto.event.TeamAssignedToRoundEvent;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.ids.TeamRoundId;
import com.project.backend.models.join_tables.TeamRound;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.repositories.TeamRoundRepository;
import com.project.backend.repositories.specifications.RoundSpecification;
import com.project.backend.repositories.specifications.TeamSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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

    private final ApplicationEventPublisher eventPublisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRoundCreatedEvent(RoundCreatedEvent event) {
        Round round = event.getRound();
        Tournament tournament = round.getTournament();

        if(roundRepository.count(RoundSpecification.byTournamentId(tournament.getId())) > 1) {
            return;
        }

        List<Team> teams = teamRepository.findAll(TeamSpecification.byTournamentId(tournament.getId()));
        List<TeamRound> teamRounds = new ArrayList<>();
        List<TeamAssignedToRoundEvent> events = new ArrayList<>();
        for(Team team : teams) {
            TeamRoundId teamRoundId = new TeamRoundId();
            teamRoundId.setRoundId(round.getId());
            teamRoundId.setTeamId(team.getId());

            TeamRound teamRound = new TeamRound();
            teamRound.setId(teamRoundId);
            teamRound.setRound(round);
            teamRound.setTeam(team);

            teamRounds.add(teamRound);
            events.add(new TeamAssignedToRoundEvent(team.getId(), round.getId()));
        }

        teamRoundRepository.saveAll(teamRounds);

        for(TeamAssignedToRoundEvent eventToSend : events) {
            eventPublisher.publishEvent(eventToSend);
        }
    }
}
