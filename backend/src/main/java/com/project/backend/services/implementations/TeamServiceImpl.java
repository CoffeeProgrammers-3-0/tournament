package com.project.backend.services.implementations;

import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.event.TeamCreatedEvent;
import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.StatisticRowDTO;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.models.ids.TeamParticipantId;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.repositories.TeamParticipantRepository;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.repositories.specifications.TeamParticipantSpecification;
import com.project.backend.repositories.specifications.TeamSpecification;
import com.project.backend.repositories.specifications.TournamentSpecification;
import com.project.backend.services.interfaces.TeamService;
import com.project.backend.services.interfaces.UserService;
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

import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final TeamParticipantRepository teamParticipantRepository;
    private final TournamentRepository tournamentRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public boolean check(Long tournamentId, User user) {
        return teamRepository.exists(Specification.allOf(TeamSpecification.byUserId(user.getId()), TeamSpecification.byTournamentId(tournamentId)));
    }

    @Override
    @Transactional
    public Team create(Long tournamentId,
                       List<UserCreateRequestForTeam> users,
                       Team team) {
        if (users == null || users.isEmpty()) {
            throw new IllegalArgumentException("Team must contain at least one participant");
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));

        if (users.size() > tournament.getMaxCountOfTeam()) {
            throw new IllegalArgumentException("Number of participants exceeds tournament maxCountOfTeam");
        }

        long leaderCount = users.stream().filter(UserCreateRequestForTeam::getIsLeader).count();
        if (leaderCount > 1) {
            throw new IllegalArgumentException("Only one leader is allowed in the team");
        }

        for (UserCreateRequestForTeam request : users) {

            boolean exists = teamParticipantRepository.exists(Specification.allOf(
                    TeamParticipantSpecification.byUserEmail(request.getEmail()),
                    TeamParticipantSpecification.byTournamentId(tournamentId)));

            if (exists) {
                throw new IllegalStateException(
                        "User with email " + request.getEmail() +
                                " already has a team in this tournament"
                );
            }
        }

        Team savedTeam = teamRepository.exists(TeamSpecification.byEmail(team.getEmail())) ? teamRepository.findOne(TeamSpecification.byEmail(team.getEmail())).orElseThrow(() -> new EntityNotFoundException("Team with email " + team.getEmail() + " not found")) : teamRepository.save(team);

        for (UserCreateRequestForTeam request : users) {
            User user = userService.findUserByEmailOrNull(request.getEmail());

            if (user == null) {
                user = new User();
                user.setFullName(request.getFullName());
                user.setEmail(request.getEmail());
                user = userService.createUser(user, Role.USER);
            }

            TeamParticipant participant = new TeamParticipant();

            TeamParticipantId id = new TeamParticipantId();
            id.setTeamId(savedTeam.getId());
            id.setUserId(user.getId());
            id.setTournamentId(tournament.getId());

            participant.setId(id);
            participant.setTeam(savedTeam);
            participant.setUser(user);
            participant.setTournament(tournament);

            participant.setIsLeader(request.getIsLeader());

            savedTeam.getTeamParticipants().add(participant);
        }
        savedTeam = teamRepository.save(savedTeam);

        TeamCreatedEvent teamCreatedEvent = new TeamCreatedEvent(savedTeam, tournament);
        eventPublisher.publishEvent(teamCreatedEvent);

        return savedTeam;
    }

    @Override
    @Transactional
    public Team update(Long teamId, Team team) {
        Team teamToUpdate = findById(teamId);

        teamToUpdate.setContact(team.getContact());
        teamToUpdate.setOrganization(team.getOrganization());
        teamToUpdate.setName(team.getName());

        return teamRepository.save(teamToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long teamId) {
        Team team = findById(teamId);
        teamRepository.delete(team);
    }

    @Override
    public Team findById(Long teamId) {
        return teamRepository.findById(teamId).orElseThrow(() -> new EntityNotFoundException("Team with id " + teamId + " not found"));
    }

    @Override
    public Page<Team> findAll(Integer page, Integer size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return teamRepository.findAll(
                TeamSpecification.byName(search),
                pageRequest);
    }

    @Override
    public Page<Team> findAllByUser(User user, Integer page, Integer size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return teamRepository.findAll(
                Specification.allOf(TeamSpecification.byName(search), TeamSpecification.byUserId(user.getId())),
                pageRequest);
    }

    @Transactional
    @Override
    public Team addMember(Long teamId, Long tournamentId, UserCreateRequestForTeam userCreateRequestForTeam) {
        Team team = findById(teamId);

        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byId(tournamentId))
                .orElseThrow(() -> new EntityNotFoundException("Tournament not found"));

        if (!SecurityUtil.isAdmin()) {
            if (tournament.getStatus() != TournamentStatus.REGISTRATION) {
                throw new IllegalStateException("Only admins can add members after registration is closed.");
            }
        }

        if (team.getTeamParticipants().size() >= tournament.getMaxCountOfTeam()) {
            throw new IllegalStateException("Cannot add member: team has reached max number of participants");
        }

        User user = userService.findUserByEmailOrNull(userCreateRequestForTeam.getEmail());

        if (user == null) {
            user = new User();
            user.setFullName(userCreateRequestForTeam.getFullName());
            user.setEmail(userCreateRequestForTeam.getEmail());
            user = userService.createUser(user, Role.USER);
        } else {
            boolean exists = teamParticipantRepository.exists(Specification.allOf(
                    TeamParticipantSpecification.byUserEmail(user.getEmail()),
                    TeamParticipantSpecification.byTournamentId(tournament.getId()))
            );
            if (exists) {
                throw new IllegalStateException("User already has a team in this tournament");
            }
        }

        TeamParticipant participant = new TeamParticipant();
        TeamParticipantId id = new TeamParticipantId();
        id.setTeamId(team.getId());
        id.setUserId(user.getId());
        id.setTournamentId(tournament.getId());

        participant.setId(id);
        participant.setTeam(team);
        participant.setUser(user);
        participant.setTournament(tournament);

        team.getTeamParticipants().add(participant);

        team = teamRepository.save(team);

        team.getTeamParticipants().add(participant);

        if(userCreateRequestForTeam.getIsLeader()) {
            team.getTeamParticipants()
                    .stream()
                    .filter(tp -> tp.getTournament().getId().equals(tournamentId))
                    .forEach(tp -> tp.setIsLeader(false));

            participant.setIsLeader(true);
        }

        return teamRepository.save(team);
    }

    @Override
    @Transactional
    public Team removeMember(Long teamId, Long userId, Long tournamentId) {
        Team team = findById(teamId);
        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byId(tournamentId))
                .orElseThrow(() -> new EntityNotFoundException("Tournament not found"));

        if (!SecurityUtil.isAdmin()) {
            if (tournament.getStatus() != TournamentStatus.REGISTRATION) {
                throw new IllegalStateException("Only admins can remove members after registration is closed.");
            }
        }

        TeamParticipant participantToRemove = team.getTeamParticipants()
                .stream()
                .filter(tp -> tp.getUser().getId().equals(userId) && tp.getTournament().getId().equals(tournamentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of the team"));

        if (participantToRemove.getIsLeader()) {
            throw new IllegalStateException("Cannot remove the leader of the team. Set a new leader first.");
        }

        team.getTeamParticipants().remove(participantToRemove);
        return teamRepository.save(team);
    }

    @Transactional
    @Override
    public Team setLeader(Long teamId, Long userId, Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));

        if (!SecurityUtil.isAdmin()) {
            if (tournament.getStatus() != TournamentStatus.REGISTRATION) {
                throw new IllegalStateException("Only admins can change leaders after registration is closed.");
            }
        }

        Team team = findById(teamId);

        team.getTeamParticipants()
                .stream()
                .filter(tp -> tp.getTournament().getId().equals(tournamentId) && tp.getIsLeader())
                .forEach(tp -> tp.setIsLeader(false));
        teamRepository.flush();

        TeamParticipant participantToSetLeader = team.getTeamParticipants()
                .stream()
                .filter(tp -> tp.getUser().getId().equals(userId) && tp.getTournament().getId().equals(tournamentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of the team"));

        participantToSetLeader.setIsLeader(true);

        return teamRepository.save(team);
    }

    @Override
    public StatisticResponse getStatisticsByRoundForTeam(Long roundId, Long teamId) {

        List<StatisticRowDTO> rows = teamRepository.getStatisticsByTeamAndRound(teamId, roundId);

        StatisticResponse response = new StatisticResponse();
        response.setPointsPerJury(new HashMap<>());

        if (rows.isEmpty()) return response;

        StatisticRowDTO first = rows.get(0);
        response.setId(first.getTeamId());
        response.setName(first.getTeamName());
        response.setEmail(first.getTeamEmail());

        for (StatisticRowDTO row : rows) {
            response.getPointsPerJury()
                    .computeIfAbsent(row.getJuryEmail(), k -> new HashMap<>())
                    .put(row.getCriteriaText(), row.getPoints().intValue());
        }

        return response;
    }

    @Override
    public StatisticResponse getStatisticsByRoundForUsersTeam(Long roundId, User user) {
        Team team = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(user.getId()), TeamSpecification.byRoundId(roundId))).orElseThrow(() -> new EntityNotFoundException("Team not found"));
        return getStatisticsByRoundForTeam(roundId, team.getId());
    }

    @Override
    public Page<Team> findAllByTournament(Integer page, Integer size, String search, Long tournamentId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return teamRepository.findAll(
                Specification.allOf(
                        TeamSpecification.byName(search),
                        TeamSpecification.byTournamentId(tournamentId)
                ),
                pageRequest);
    }

    @Override
    public Page<Team> findAllByRound(Integer page, Integer size, String search, Long roundId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return teamRepository.findAll(
                Specification.allOf(
                        TeamSpecification.byName(search),
                        TeamSpecification.byRoundId(roundId)
                ),
                pageRequest);
    }

    @Override
    public Page<Team> findAllByRoundNot(Integer page, Integer size, String search, Long roundId) {
        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byRoundId(roundId)).orElseThrow(() -> new EntityNotFoundException("Tournament for round with id " + roundId + " not found"));
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
        return teamRepository.findAll(
                Specification.allOf(
                        TeamSpecification.byName(search),
                        TeamSpecification.byRoundIdNot(roundId),
                        TeamSpecification.byTournamentId(tournament.getId())
                ),
                pageRequest);
    }

    @Transactional
    @Override
    public List<TeamLeaderboardResponse> getAllStatsByRoundId(Long roundId, Double lastTeamPoints, Long lastTeam, Integer size) {
        return teamRepository.findLeaderboard(roundId, lastTeamPoints, lastTeam, size);
    }

    @Transactional
    @Override
    public List<TeamLeaderboardResponse> getAllStatsByRoundId(Long roundId) {
        return teamRepository.findLeaderboard(roundId);
    }
}
