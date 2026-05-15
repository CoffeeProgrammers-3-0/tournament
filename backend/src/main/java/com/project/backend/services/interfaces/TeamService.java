package com.project.backend.services.interfaces;

import com.project.backend.dto.leaderboard.LeaderboardResponse;
import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TeamService {
    boolean check(Long tournamentId, User user);

    Team create(Long tournamentId, List<UserCreateRequestForTeam> users, Team team);

    Team update(Long teamId, Team team);

    void delete(Long teamId);

    Team findById(Long teamId);

    Page<Team> findAll(Integer page, Integer size, String search);

    Page<Team> findAllByUser(User user, Integer page, Integer size, String search);

    @Transactional
    Team setLeader(Long teamId, Long userId, Long tournamentId);

    StatisticResponse getStatisticsByRoundForTeam(Long roundId, Long teamId);

    StatisticResponse getStatisticsByRoundForUsersTeam(Long roundId, User user);

    @Transactional
    Team addMember(Long teamId, Long tournamentId, UserCreateRequestForTeam userCreateRequestForTeam);

    Team removeMember(Long teamId, Long userId, Long tournamentId);

    Page<Team> findAllByTournament(Integer page, Integer size, String search, Long tournamentId);

    @Transactional
    LeaderboardResponse getAllStatsByRoundId(Long roundId, Double lastTeamPoints, Long lastTeam, Integer size);

    @Transactional
    List<TeamLeaderboardResponse> getAllStatsByRoundId(Long roundId);

    Page<Team> findAllByRound(Integer page, Integer size, String search, Long roundId);

    Page<Team> findAllByRoundNot(Integer page, Integer size, String search, Long roundId);

    Long getIdOfMyTeamByRound(Long roundId, User me);
}
