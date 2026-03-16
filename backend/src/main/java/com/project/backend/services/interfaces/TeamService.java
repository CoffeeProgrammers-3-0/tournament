package com.project.backend.services.interfaces;

import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.models.Team;
import com.project.backend.models.User;
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

    StatisticResponse getStatisticsByRoundForTeam(Long roundId, Long teamId);

    StatisticResponse getStatisticsByRoundForUsersTeam(Long roundId, User user);

    Team addMember(Long teamId, UserCreateRequestForTeam userCreateRequestForTeam);

    Team removeMember(Long teamId, Long userId);

    Team setLeader(Long teamId, Long userId);

    Page<Team> findAllByTournament(Integer page, Integer size, String search, Long tournamentId);
}
