package com.project.backend.services.implementations;

import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.event.*;
import com.project.backend.dto.leaderboard.LeaderboardResponse;
import com.project.backend.dto.team.PointResponse;
import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.StatisticRowDTO;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.mappers.CategoryMapper;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.models.ids.TeamParticipantId;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.*;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TeamServiceImpl implements TeamService {
    private final JurySubmissionRepository jurySubmissionRepository;
    private final JuryRepository juryRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TeamParticipantRepository teamParticipantRepository;
    private final TournamentRepository tournamentRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public boolean check(Long tournamentId, User user) {
        return teamRepository.exists(Specification.allOf(TeamSpecification.byUserId(user.getId()), TeamSpecification.byTournamentId(tournamentId)));
    }

    @Override
    @Transactional
    public Team create(Long tournamentId,
                       List<UserCreateRequestForTeam> users,
                       Team team) {
        checkDraftAccessTournament(tournamentId);
        if (users == null || users.isEmpty()) {
            throw new IllegalArgumentException("Team must contain at least one participant");
        }

        long uniqueCount = users.stream()
                .map(UserCreateRequestForTeam::getEmail)
                .distinct()
                .count();

        if (uniqueCount < users.size()) {
            throw new IllegalArgumentException("Team contains duplicate participants");
        }

        if (teamRepository.existsByEmailAndTournamentId(team.getEmail(), tournamentId)) {
            throw new IllegalArgumentException("Can`t create team with duplicate email on same tournament");
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));

        if (tournament.getStatus() != TournamentStatus.REGISTRATION) {
            throw new IllegalStateException("Can not create team on tournament with status " + tournament.getStatus());
        }

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
            } else {
                if (user.getRole() == Role.JURY) {
                    throw new IllegalStateException("Jury " + user.getEmail() + " can not be member of a team");
                }
                if (user.getRole() == Role.ADMIN) {
                    throw new IllegalStateException("Admin " + user.getEmail() + " can not be member of a team");
                }
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
        List<Long> rounds = roundRepository.findAll(RoundSpecification.byTeamId(teamId)).stream().map(Round::getId).toList();
        teamRepository.delete(team);

        TeamDeletedEvent teamDeletedEvent = new TeamDeletedEvent(teamId, rounds);
        eventPublisher.publishEvent(teamDeletedEvent);
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
        checkDraftAccessTournament(tournamentId);
        Team team = findById(teamId);

        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byId(tournamentId))
                .orElseThrow(() -> new EntityNotFoundException("Tournament not found"));

        if (!SecurityUtil.isAdmin()) {
            if (tournament.getStatus() != TournamentStatus.REGISTRATION) {
                throw new IllegalStateException("Only admins can add members after registration is closed.");
            }
        }

        if (team.getTeamParticipants().stream().filter(tp -> Objects.equals(tp.getTournament().getId(), tournamentId)).count() >= tournament.getMaxCountOfTeam()) {
            throw new IllegalStateException("Cannot add member: team has reached max number of participants");
        }

        User user = userService.findUserByEmailOrNull(userCreateRequestForTeam.getEmail());

        if (user == null) {
            user = new User();
            user.setFullName(userCreateRequestForTeam.getFullName());
            user.setEmail(userCreateRequestForTeam.getEmail());
            user = userService.createUser(user, Role.USER);
        } else {
            if (user.getRole() == Role.JURY) {
                throw new IllegalStateException("Jury " + user.getEmail() + " can not be member of a team");
            }

            if (user.getRole() == Role.ADMIN) {
                throw new IllegalStateException("Admin " + user.getEmail() + " can not be member of a team");
            }

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

        if (userCreateRequestForTeam.getIsLeader()) {
            team.getTeamParticipants()
                    .stream()
                    .filter(tp -> tp.getTournament().getId().equals(tournamentId))
                    .forEach(tp -> tp.setIsLeader(false));

            participant.setIsLeader(true);
        }

        team = teamRepository.save(team);

        UserAddedToTeamEvent event = new UserAddedToTeamEvent(participant);
        eventPublisher.publishEvent(event);

        return team;
    }

    @Override
    @Transactional
    public Team removeMember(Long teamId, Long userId, Long tournamentId) {
        checkDraftAccessTournament(tournamentId);
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
        UserRemovedFromTeamEvent event = new UserRemovedFromTeamEvent(participantToRemove.getTeam(), participantToRemove.getUser(), participantToRemove.getTournament());
        team = teamRepository.save(team);

        eventPublisher.publishEvent(event);

        return team;
    }

    @Transactional
    @Override
    public Team setLeader(Long teamId, Long userId, Long tournamentId) {
        checkDraftAccessTournament(tournamentId);
        Tournament tournament = tournamentRepository.findById(tournamentId).orElseThrow(() -> new EntityNotFoundException("Tournament with id " + tournamentId + " not found"));

        if (!SecurityUtil.isAdmin()) {
            if (tournament.getStatus() != TournamentStatus.REGISTRATION) {
                throw new IllegalStateException("Only admins can change leaders after registration is closed.");
            }
        }

        Team team = findById(teamId);

        List<TeamParticipant> leaders = team.getTeamParticipants()
                .stream()
                .filter(tp -> tp.getTournament().getId().equals(tournamentId) && tp.getIsLeader()).toList();


        leaders.forEach(tp -> tp.setIsLeader(false));

        teamRepository.flush();

        TeamParticipant participantToSetLeader = team.getTeamParticipants()
                .stream()
                .filter(tp -> tp.getUser().getId().equals(userId) && tp.getTournament().getId().equals(tournamentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User is not a member of the team"));

        participantToSetLeader.setIsLeader(true);

        team = teamRepository.save(team);

        UserSetToLeaderEvent event = new UserSetToLeaderEvent(participantToSetLeader);
        eventPublisher.publishEvent(event);

        leaders.stream().map(UserIsNoLongerLeaderEvent::new).forEach(eventPublisher::publishEvent);

        return team;
    }

    @Override
    public StatisticResponse getStatisticsByRoundForTeam(Long roundId, Long teamId) {
        checkDraftAccessRound(roundId);
        List<StatisticRowDTO> rows = teamRepository.getStatisticsByTeamAndRound(teamId, roundId);

        log.info("Statistics for team {} and round {}: {}", teamId, roundId, rows);
        StatisticResponse response = new StatisticResponse();

        response.setPointsPerJury(new HashMap<>());
        response.setAdditionalPointsPerJury(new HashMap<>());

        if (rows.isEmpty()) return response;

        StatisticRowDTO first = rows.get(0);
        response.setId(first.getTeamId());
        response.setName(first.getTeamName());
        response.setEmail(first.getTeamEmail());
        response.setCategories(
                categoryRepository.findAll(
                        CategorySpecification.byRoundId(roundId)
                ).stream().map(categoryMapper::fromCategoryToResponse).toList());
        response.setJuryEmails(
                jurySubmissionRepository.findAll(
                        Specification.allOf(
                                JurySubmissionSpecification.byRoundId(roundId),
                                JurySubmissionSpecification.byTeamId(teamId)
                        )
                ).stream().map(js -> js.getJury().getEmail()).toList());

        for (StatisticRowDTO row : rows) {
            if (row.isAdditional()) {
                response.getAdditionalPointsPerJury()
                        .computeIfAbsent(row.getJuryEmail(), k -> new ArrayList<>())
                        .add(new PointResponse(row.getPoints(), row.getComment()));
            } else {
                response.getPointsPerJury()
                        .computeIfAbsent(row.getJuryEmail(), k -> new HashMap<>())
                        .put(row.getCriteriaText(), new PointResponse(row.getPoints(), row.getComment()));
            }
        }

        return response;
    }

    @Override
    public StatisticResponse getStatisticsByRoundForUsersTeam(Long roundId, User user) {
        checkDraftAccessRound(roundId);
        Team team = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(user.getId()), TeamSpecification.byRoundId(roundId))).orElseThrow(() -> new EntityNotFoundException("Team not found"));
        return getStatisticsByRoundForTeam(roundId, team.getId());
    }

    @Override
    public Page<Team> findAllByTournament(Integer page, Integer size, String search, Long tournamentId) {
        checkDraftAccessTournament(tournamentId);
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
        checkDraftAccessRound(roundId);
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
        checkDraftAccessRound(roundId);
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

    @Override
    public Long getIdOfMyTeamByRound(Long roundId, User me) {
        Team team = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(me.getId()), TeamSpecification.byRoundId(roundId))).orElse(null);
        ;
        return team == null ? -1 : team.getId();
    }

    @Transactional
    @Override
    public LeaderboardResponse getAllStatsByRoundId(Long roundId, Double lastTeamPoints, Long lastTeam, Integer size) {
        checkDraftAccessRound(roundId);
        Long maxPoints = categoryRepository.calculateMaxPointsPerRoundOnlyDefault(roundId);

        LeaderboardResponse leaderboardResponse = new LeaderboardResponse();
        leaderboardResponse.setMaxPoints(maxPoints + 20); // 20 is additional points
        leaderboardResponse.setLeaderboard(teamRepository.findLeaderboard(roundId, lastTeamPoints, lastTeam, size));

        return leaderboardResponse;
    }

    @Transactional
    @Override
    public List<TeamLeaderboardResponse> getAllStatsByRoundId(Long roundId) {
        checkDraftAccessRound(roundId);
        return teamRepository.findLeaderboard(roundId);
    }

    private void checkDraftAccessRound(Long roundId) {
        if (!SecurityUtil.isAdmin()) {
            Round round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new EntityNotFoundException("Round not found"));

            if (round.getTournament().getStatus() == TournamentStatus.DRAFT || round.getStatus() == RoundStatus.DRAFT) {
                throw new EntityNotFoundException("Round not found");
            }
        }
    }

    private void checkDraftAccessTournament(Long tournamentId) {
        if (!SecurityUtil.isAdmin()) {
            Tournament tournament = tournamentRepository.findById(tournamentId)
                    .orElseThrow(() -> new EntityNotFoundException("Tournament not found"));

            if (tournament.getStatus() == TournamentStatus.DRAFT) {
                throw new EntityNotFoundException("Tournament not found");
            }
        }
    }
}
