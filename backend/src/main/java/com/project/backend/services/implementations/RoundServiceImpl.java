package com.project.backend.services.implementations;

import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.event.*;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.models.ids.JuryId;
import com.project.backend.models.ids.TeamRoundId;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.JurySubmission;
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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
    private final SubmissionRepository submissionRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Round create(Long tournamentId, Round round) {

        if (tournamentId == null || round == null) {
            throw new IllegalArgumentException("TournamentId and round must not be null");
        }

        Tournament tournament = tournamentRepository.findOne(
                TournamentSpecification.byId(tournamentId)
        ).orElseThrow(() -> new EntityNotFoundException("Tournament not found"));

        if(tournament.getStatus() == TournamentStatus.FINISHED) {
            throw new IllegalStateException("Can not create round on FINISHED tournament");
        }

        long actualCountOfRounds = roundRepository.count(
                RoundSpecification.byTournamentId(tournamentId)
        );

        if (actualCountOfRounds >= tournament.getCountOfRounds()) {
            throw new IllegalStateException("Tournament already has max count of rounds");
        }

        if (round.getStartDate() == null || round.getEndDate() == null) {
            throw new IllegalArgumentException("StartDate and EndDate must not be null");
        }

        if (round.getStartDate().isAfter(round.getEndDate())) {
            throw new IllegalStateException("Start date must be before end date");
        }

        if (round.getStartDate().isBefore(tournament.getStartTournament())) {
            throw new IllegalStateException("Start date must be after or equal to tournament start date");
        }

        round.setTournament(tournament);
        round.setStatus(RoundStatus.DRAFT);

        Round saved = roundRepository.save(round);

        eventPublisher.publishEvent(new RoundCreatedEvent(saved));

        return saved;
    }

    @Override
    @Transactional
    public Round update(Long roundId, Round round) {

        if (roundId == null || round == null) {
            throw new IllegalArgumentException("RoundId and round must not be null");
        }

        Round existing = findById(roundId);
        Tournament tournament = existing.getTournament();

        if (tournament.getStatus() == TournamentStatus.FINISHED) {
            throw new IllegalStateException("Cannot update rounds of finished tournament");
        }

        if (existing.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot modify evaluated round");
        }

        if (round.getStartDate() != null && round.getEndDate() != null &&
                round.getStartDate().isAfter(round.getEndDate())) {
            throw new IllegalStateException("Invalid dates");
        }

        if(teamRoundRepository.count(TeamRoundSpecification.byRoundId(roundId)) > 0) {
            if(round.getStatus() == RoundStatus.DRAFT) {
                throw new IllegalArgumentException("Can not set round status to draft, because round already has a team");
            }
        }

        existing.setName(round.getName());
        existing.setRequirements(round.getRequirements());
        existing.setEndDate(round.getEndDate());
        existing.setTask(round.getTask());
        existing.setCountOfWinners(round.getCountOfWinners());

        return roundRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long roundId) {

        if (roundId == null) {
            throw new IllegalArgumentException("RoundId must not be null");
        }

        Round round = findById(roundId);

        if (round.getStatus() != RoundStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT rounds can be deleted");
        }

        roundRepository.delete(round);
    }

    @Override
    public Page<Round> findAllByTournament(Long tournamentId, Integer page, Integer size, String search, RoundStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startDate"));

        Specification<Round> spec = Specification.allOf(
                RoundSpecification.byTournamentId(tournamentId),
                RoundSpecification.byStatus(status)
        );

        if (!SecurityUtil.isAdmin()) {
            spec = spec.and(RoundSpecification.notDraft());
        }

        return roundRepository.findAll(spec, pageRequest);
    }

    @Override
    public Page<Round> findAllByRoundInSameTournament(Long roundId, Integer page, Integer size, String search, RoundStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startDate"));

        Specification<Round> spec = Specification.allOf(
                RoundSpecification.belongingToSameTournamentAs(roundId),
                RoundSpecification.byStatus(status)
        );

        if (!SecurityUtil.isAdmin()) {
            spec = spec.and(RoundSpecification.notDraft());
        }

        return roundRepository.findAll(spec, pageRequest);
    }

    @Override
    public Round findById(Long roundId) {
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));

        if (!SecurityUtil.isAdmin() &&
            (round.getStatus() == RoundStatus.DRAFT ||
             round.getTournament().getStatus() == TournamentStatus.DRAFT)) {
            throw new EntityNotFoundException("Round with id " + roundId + " not found");
        }

        return round;
    }

    @Override
    @Transactional
    public void setJury(Long roundId, Long juryId) {

        if (roundId == null || juryId == null) {
            throw new IllegalArgumentException("RoundId and juryId must not be null");
        }

        Round round = findById(roundId);

        if (round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot assign jury after evaluation started");
        }

        if (juryRepository.exists(JurySpecification.byUserIdAndRoundId(juryId, roundId))) {
            throw new IllegalStateException("Jury already assigned");
        }

        User juryUser = userRepository.findById(juryId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (juryUser.getRole() != Role.JURY) {
            throw new IllegalStateException("User must have jury role");
        }

        JuryId id = new JuryId();
        id.setRoundId(roundId);
        id.setUserId(juryId);

        Jury jury = new Jury();
        jury.setId(id);
        jury.setRound(round);
        jury.setUser(juryUser);

        juryRepository.save(jury);

        JuryAssignedToRoundEvent event = new JuryAssignedToRoundEvent(jury);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void removeJury(Long roundId, Long juryId) {

        Round round = findById(roundId);

        if (round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot modify jury after evaluation ended");
        }

        if (!juryRepository.exists(JurySpecification.byUserIdAndRoundId(juryId, roundId))) {
            throw new IllegalStateException("Jury not assigned");
        }
        Jury jury = juryRepository.findOne(JurySpecification.byUserIdAndRoundId(juryId, roundId)).orElseThrow(() -> new EntityNotFoundException("Jury with id " + juryId + " for round with id " + roundId + " not found"));

        juryRepository.delete(jury);

        JuryUnassignedFromRoundEvent event = new JuryUnassignedFromRoundEvent(jury.getUser(), jury.getRound());
        eventPublisher.publishEvent(event);

        List<JurySubmission> jurySubmissions = jurySubmissionRepository.findAll(Specification.allOf(
                JurySubmissionSpecification.byJuryId(juryId),
                JurySubmissionSpecification.byRoundId(roundId)
        ));

        List<Long> teamIds = jurySubmissions.stream().map(js -> js.getSubmission().getTeam().getId()).distinct().toList();
        List<PointsChangedForTeamEvent> events = new ArrayList<>();
        for(Long teamId : teamIds) {
            events.add(new PointsChangedForTeamEvent(teamId, roundId));
        }

        jurySubmissionRepository.deleteAll(jurySubmissions);

        events.forEach(eventPublisher::publishEvent);
    }

    @Override
    @Transactional
    public void assignTeams(Long roundId, List<Long> teamIds) {

        if (roundId == null || teamIds == null || teamIds.isEmpty()) {
            throw new IllegalArgumentException("Invalid input");
        }

        Round round = findById(roundId);

        if (round.getStatus() == RoundStatus.SUBMISSION_CLOSED ||
                round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot assign teams after submission closed");
        }

        List<TeamRound> teamRounds = new ArrayList<>();
        List<TeamAssignedToRoundEvent> events = new ArrayList<>();

        for (Long teamId : teamIds) {

            if (teamRoundRepository.exists(
                    Specification.allOf(TeamRoundSpecification.byRoundId(roundId), TeamRoundSpecification.byTeamId(teamId)))) {
                continue;
            }

            Team team = teamRepository.getReferenceById(teamId);

            TeamRoundId id = new TeamRoundId();
            id.setRoundId(roundId);
            id.setTeamId(teamId);

            TeamRound tr = new TeamRound();
            tr.setId(id);
            tr.setRound(round);
            tr.setTeam(team);

            teamRounds.add(tr);

            events.add(new TeamAssignedToRoundEvent(teamId, roundId));
        }

        teamRoundRepository.saveAll(teamRounds);

        for(TeamAssignedToRoundEvent event : events) {
            eventPublisher.publishEvent(event);
        }
    }

    @Override
    @Transactional
    public void unassignTeams(Long roundId, List<Long> teamIds) {

        Round round = findById(roundId);

        if (round.getStatus() == RoundStatus.SUBMISSION_CLOSED ||
                round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot modify teams after submission closed");
        }

        List<TeamRoundId> ids = new ArrayList<>();
        List<TeamUnassignedFromRoundEvent> events = new ArrayList<>();

        for (Long teamId : teamIds) {
            TeamRoundId id = new TeamRoundId();
            id.setRoundId(roundId);
            id.setTeamId(teamId);
            ids.add(id);
            events.add(new TeamUnassignedFromRoundEvent(teamId, roundId));
        }

        teamRoundRepository.deleteAllById(ids);
        submissionRepository.delete(Specification.allOf(SubmissionSpecification.byRoundId(roundId), SubmissionSpecification.byTeamIds(teamIds)));

        for(TeamUnassignedFromRoundEvent event : events) {
            eventPublisher.publishEvent(event);
        }
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

    @Override
    @Transactional
    public void startRound(Long roundId) {
        Round round = findById(roundId);

        if(round.getStatus() != RoundStatus.DRAFT) {
            throw new IllegalStateException("Only rounds with DRAFT status can be started");
        }

        if(round.getTournament().getStatus() != TournamentStatus.RUNNING) {
            throw new IllegalStateException("Can not start round on tournament that is not RUNNING(currently: "+round.getTournament().getStatus()+")");
        }

        round.setStatus(RoundStatus.ACTIVE);
        round.setStartDate(Instant.now());
        if(round.getEndDate().isBefore(round.getStartDate())) {
            round.setEndDate(round.getStartDate().plus(1, ChronoUnit.DAYS));
        }

        roundRepository.save(round);

        RoundStartedEvent event = new RoundStartedEvent(roundId);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void closeSubmissions(Long roundId) {
        Round round = findById(roundId);

        if(round.getStatus() != RoundStatus.ACTIVE) {
            throw new IllegalStateException("Can not close submissions on round with status " + round.getStatus());
        }

        if(round.getTournament().getStatus() != TournamentStatus.RUNNING) {
            throw new IllegalStateException("Can not set round to SUBMISSION_CLOSED on tournament that is not RUNNING(currently: "+round.getTournament().getStatus()+")");
        }

        round.setStatus(RoundStatus.SUBMISSION_CLOSED);
        round.setEndDate(Instant.now());
        roundRepository.save(round);

        RoundSubmissionClosedEvent event = new RoundSubmissionClosedEvent(roundId);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void evaluate(Long roundId) {
        Round round = findById(roundId);

        if(round.getStatus() != RoundStatus.SUBMISSION_CLOSED) {
            throw new IllegalStateException("Can not evaluate round with status " + round.getStatus());
        }

        if(round.getTournament().getStatus() != TournamentStatus.RUNNING) {
            throw new IllegalStateException("Can not set round to EVALUATED on tournament that is not RUNNING(currently: "+round.getTournament().getStatus()+")");
        }

        round.setStatus(RoundStatus.EVALUATED);
        roundRepository.save(round);

        RoundEvaluatedEvent event = new RoundEvaluatedEvent(roundId);
        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public void rollbackCloseSubmissions(Long roundId) {
        Round round = findById(roundId);

        if(round.getStatus() != RoundStatus.EVALUATED) {
            throw new IllegalStateException("Can not rollback round status from " + round.getStatus() + " to SUBMISSION_CLOSED");
        }

        if(round.getTournament().getStatus() == TournamentStatus.FINISHED) {
            throw new IllegalStateException("Can not rollback round to SUBMISSION_CLOSED on tournament that is FINISHED");
        }

        round.setStatus(RoundStatus.SUBMISSION_CLOSED);
        roundRepository.save(round);
    }

    @Override
    @Transactional
    public void rollbackStartRound(Long roundId) {
        Round round = findById(roundId);

        if(round.getStatus() != RoundStatus.SUBMISSION_CLOSED) {
            throw new IllegalStateException("Can not rollback round status from " + round.getStatus() + " to ACTIVE");
        }

        if(round.getTournament().getStatus() == TournamentStatus.FINISHED) {
            throw new IllegalStateException("Can not rollback round to ACTIVE on tournament that is FINISHED");
        }

        round.setStatus(RoundStatus.ACTIVE);
        round.setEndDate(Instant.now().plus(1, ChronoUnit.DAYS));
        roundRepository.save(round);
    }

    @Override
    @Transactional
    public void draft(Long roundId) {
        Round round = findById(roundId);

        if(round.getStatus() != RoundStatus.ACTIVE) {
            throw new IllegalStateException("Can not rollback round status from " + round.getStatus() + " to DRAFT");
        }

        if(round.getTournament().getStatus() == TournamentStatus.FINISHED) {
            throw new IllegalStateException("Can not rollback round to DRAFT on tournament that is FINISHED");
        }

        if(teamRoundRepository.exists(TeamRoundSpecification.byRoundId(roundId))) {
            throw new IllegalStateException("Can not rollback round that has teams to DRAFT");
        }

        round.setStatus(RoundStatus.DRAFT);
        round.setStartDate(Instant.now().plus(1, ChronoUnit.DAYS));
        if(round.getEndDate().isBefore(round.getStartDate())) {
            round.setEndDate(round.getStartDate().plus(1, ChronoUnit.DAYS));
        }

        roundRepository.save(round);
    }
}
