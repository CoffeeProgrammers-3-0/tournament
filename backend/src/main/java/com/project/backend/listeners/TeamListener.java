package com.project.backend.listeners;

import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TeamRoundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TeamListener {
    private final RoundRepository roundRepository;
    private final TeamRoundRepository teamRoundRepository;

    private final ApplicationEventPublisher eventPublisher;

//    @Transactional(propagation = Propagation.REQUIRES_NEW)
//    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
//    public void handleTeamCreatedEvent(TeamCreatedEvent event) {
//        Team team = event.getTeam();
//        Tournament tournament = event.getTournament();
//        Round firstRound = roundRepository.findFirstByTournamentIdOrderByStartDateAsc(tournament.getId()).orElse(null);
//        if(firstRound != null) {
//            TeamRoundId teamRoundId = new TeamRoundId();
//            teamRoundId.setTeamId(team.getId());
//            teamRoundId.setRoundId(firstRound.getId());
//
//            TeamRound teamRound = new TeamRound();
//            teamRound.setId(teamRoundId);
//            teamRound.setTeam(team);
//            teamRound.setRound(firstRound);
//
//            teamRoundRepository.save(teamRound);
//
//            TeamAssignedToRoundEvent event1 = new TeamAssignedToRoundEvent(team.getId(), firstRound.getId());
//            eventPublisher.publishEvent(event1);
//        }
//    }
}
