package com.project.backend.services.implementations;

import com.project.backend.dto.event.RoundCreatedEvent;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.ids.JuryId;
import com.project.backend.models.ids.TeamRoundId;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.TeamRound;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.*;
import com.project.backend.services.interfaces.RoundService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoundServiceImpl implements RoundService {
    private final RoundRepository roundRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final JuryRepository juryRepository;
    private final JurySubmissionRepository jurySubmissionRepository;
    private final TeamRoundRepository teamRoundRepository;
    private final TeamRepository teamRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Round create(Long tournamentId, Round round) {
        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byId(tournamentId)).orElseThrow(() -> new EntityNotFoundException("Tournament not found"));
        long actualCountOfRounds = roundRepository.count(RoundSpecification.byTournamentId(tournamentId));
        if(actualCountOfRounds >= tournament.getCountOfRounds()) {
            throw new IllegalStateException("Tournament already has max count of rounds, change this value in tournament settings");
        }
        round.setTournament(tournament);
        round.setStatus(RoundStatus.DRAFT);
        round = roundRepository.save(round);

        RoundCreatedEvent roundCreatedEvent = new RoundCreatedEvent(round);
        eventPublisher.publishEvent(roundCreatedEvent);

        return round;
    }

    @Override
    @Transactional
    public Round update(Long roundId, Round round) {
        Round roundToUpdate = findById(roundId);

        roundToUpdate.setName(round.getName());
        roundToUpdate.setRequirements(round.getRequirements());
        roundToUpdate.setStatus(round.getStatus());
        roundToUpdate.setEndDate(round.getEndDate());
        roundToUpdate.setStartDate(round.getStartDate());
        roundToUpdate.setTask(round.getTask());
        roundToUpdate.setCountOfWinners(round.getCountOfWinners());

        return roundRepository.save(roundToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long roundId) {
        Round round = findById(roundId);
        roundRepository.delete(round);
    }

    @Override
    public Page<Round> findAllByTournament(Long tournamentId, Integer page, Integer size, String search, RoundStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startDate"));
        return roundRepository.findAll(Specification.allOf(RoundSpecification.byTournamentId(tournamentId), RoundSpecification.byStatus(status)), pageRequest);
    }

    @Override
    public Page<Round> findAllByRoundInSameTournament(Long roundId, Integer page, Integer size, String search, RoundStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startDate"));
        return roundRepository.findAll(Specification.allOf(RoundSpecification.belongingToSameTournamentAs(roundId), RoundSpecification.byStatus(status)), pageRequest);
    }

    @Override
    public Round findById(Long roundId) {
        return roundRepository.findById(roundId).orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));
    }

    @Override
    @Transactional
    public void setJury(Long roundId, Long juryId) {
        if(juryRepository.exists(JurySpecification.byUserIdAndRoundId(juryId, roundId))) {
            throw new IllegalStateException("Jury with id " + juryId + " is already assigned to round with id " + roundId);
        }

        Round round = findById(roundId);
        User juryUser = userRepository.findById(juryId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        if(juryUser.getRole() != Role.JURY) {
            throw new IllegalStateException("User must have jury role to be jury");
        }

        JuryId juryEmbeddedId = new JuryId();
        juryEmbeddedId.setRoundId(roundId);
        juryEmbeddedId.setUserId(juryId);

        Jury jury = new Jury();
        jury.setId(juryEmbeddedId);
        jury.setRound(round);
        jury.setUser(juryUser);

        juryRepository.save(jury);
    }

    @Override
    @Transactional
    public void removeJury(Long roundId, Long juryId) {
        if(!juryRepository.exists(JurySpecification.byUserIdAndRoundId(juryId, roundId))) {
            throw new IllegalStateException("Jury with id " + juryId + " is not assigned to round with id " + roundId);
        }

        juryRepository.delete(JurySpecification.byUserIdAndRoundId(juryId, roundId));
        jurySubmissionRepository.delete(JurySubmissionSpecification.byJuryId(juryId));
    }

    @Override
    @Transactional
    public void assignTeams(Long roundId, List<Long> teamIds) {
        Round round = roundRepository.getReferenceById(roundId);
        Team team;
        List<TeamRound> teamRounds = new ArrayList<>();
        for(Long teamId : teamIds) {
            team = teamRepository.getReferenceById(teamId);

            TeamRoundId teamRoundId = new TeamRoundId();
            teamRoundId.setTeamId(teamId);
            teamRoundId.setRoundId(roundId);

            TeamRound teamRound = new TeamRound();
            teamRound.setId(teamRoundId);
            teamRound.setTeam(team);
            teamRound.setRound(round);

            teamRounds.add(teamRound);
        }

        teamRoundRepository.saveAll(teamRounds);
    }

    @Override
    @Transactional
    public void unassignTeams(Long roundId, List<Long> teamIds) {
        List<TeamRoundId> teamRoundIds = new ArrayList<>();
        TeamRoundId teamRoundId;
        for(Long teamId : teamIds) {
            teamRoundId = new TeamRoundId();
            teamRoundId.setRoundId(roundId);
            teamRoundId.setTeamId(teamId);
            teamRoundIds.add(teamRoundId);
        }
        teamRoundRepository.deleteAllById(teamRoundIds);
    }

    @Override
    @Transactional
    public void assignAllTeams(Long roundId) {
        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byRoundId(roundId)).orElseThrow(() -> new EntityNotFoundException("Tournament for round with id " + roundId + " not found"));
        assignTeams(roundId, teamRepository.findAll(TeamSpecification.byTournamentId(tournament.getId())).stream().map(Team::getId).toList());
    }

    @Override
    @Transactional
    public void unassignAllTeams(Long roundId) {
        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byRoundId(roundId)).orElseThrow(() -> new EntityNotFoundException("Tournament for round with id " + roundId + " not found"));
        unassignTeams(roundId, teamRepository.findAll(TeamSpecification.byTournamentId(tournament.getId())).stream().map(Team::getId).toList());
    }
}
