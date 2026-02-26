package com.project.backend.services.implementations;

import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.services.interfaces.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;

    @Override
    public boolean check(Long tournamentId, User user) {
        // TODO
        return false;
    }

    @Override
    public Team create(Long tournamentId, List<UserCreateRequestForTeam> users, Team team) {
        // TODO
        return null;
    }

    @Override
    public Team update(Long teamId, Team team) {
        // TODO
        return null;
    }

    @Override
    public void delete(Long teamId) {
        // TODO
    }

    @Override
    public Team findById(Long teamId) {
        // TODO
        return null;
    }

    @Override
    public Page<Team> findAll(Integer page, Integer size, String search) {
        // TODO
        return null;
    }

    @Override
    public Page<Team> findAllByUser(User user, Integer page, Integer size, String search) {
        // TODO
        return null;
    }

    @Override
    public StatisticResponse getStatisticsByRoundForTeam(Long roundId, Long teamId) {
        // TODO
        return null;
    }

    @Override
    public StatisticResponse getStatisticsByRoundForUsersTeam(Long roundId, User user) {
        // TODO
        return null;
    }

    @Override
    public Team addMember(Long teamId, UserCreateRequestForTeam userCreateRequestForTeam) {
        // TODO
        return null;
    }

    @Override
    public Team removeMember(Long teamId, Long userId) {
        // TODO
        return null;
    }

    @Override
    public Team setLeader(Long teamId, Long userId) {
        // TODO
        return null;
    }
}
