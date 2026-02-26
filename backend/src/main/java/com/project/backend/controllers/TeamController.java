package com.project.backend.controllers;

import com.project.backend.dto.team.*;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.TeamMapper;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.TeamService;
import com.project.backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/teams")
public class TeamController {
    private final TeamService teamService;
    private final UserService userService;
    private final TeamMapper teamMapper;

    @GetMapping("/check/{tournament_id}")
    public boolean checkIfRegistered(@PathVariable(value = "tournament_id") Long tournamentId, Authentication authentication) {
        User me = userService.findUserByAuth(authentication);

        return teamService.check(tournamentId, me);
    }

    @PostMapping("/{tournament_id}")
    public TeamFullResponse create(@PathVariable(value = "tournament_id") Long tournamentId, @RequestBody TeamCreateRequest teamCreateRequest, Authentication authentication) {
        Team team = teamService.create(tournamentId, teamCreateRequest.getUsers(), teamMapper.fromCreateRequestToTeam(teamCreateRequest));

        return teamMapper.fromTeamToFullResponse(team);
    }

    @PutMapping("/{team_id}")
    public TeamFullResponse create(@PathVariable(value = "team_id") Long teamId, @RequestBody TeamUpdateRequest teamUpdateRequest, Authentication authentication) {
        Team team = teamService.update(teamId, teamMapper.fromUpdateRequestToTeam(teamUpdateRequest));

        return teamMapper.fromTeamToFullResponse(team);
    }

    @DeleteMapping("/{team_id}")
    public void delete(@PathVariable(value = "team_id") Long teamId, Authentication authentication) {
        teamService.delete(teamId);
    }

    @GetMapping("/{team_id}")
    public TeamFullResponse getById(@PathVariable(value = "team_id") Long teamId, Authentication authentication) {
        Team team = teamService.findById(teamId);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @GetMapping
    public PaginationListResponse<TeamListResponse> getAll(@RequestParam(value = "search") String search, @RequestParam(value = "page") Integer page, @RequestParam(value = "size") Integer size) {
        Page<Team> teamPage = teamService.findAll(page, size, search);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream().map(teamMapper::fromTeamToListResponse).toList());

        return response;
    }

    @GetMapping("/my")
    public PaginationListResponse<TeamListResponse> getAllMy(@RequestParam(value = "search") String search, @RequestParam(value = "page") Integer page, @RequestParam(value = "size") Integer size, Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Page<Team> teamPage = teamService.findAllByUser(me, page, size, search);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream().map(teamMapper::fromTeamToListResponse).toList());

        return response;
    }

    @GetMapping("/{team_id}/statistics/{round_id}")
    public StatisticResponse getStatsForTeam(@PathVariable(value = "team_id") Long teamId, @PathVariable(value = "round_id") Long roundId) {
        return teamService.getStatisticsByRoundForTeam(roundId, teamId);
    }

    @GetMapping("/statistics/{round_id}")
    public StatisticResponse getStatsForMyTeam(@PathVariable(value = "round_id") Long roundId, Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        return teamService.getStatisticsByRoundForUsersTeam(roundId, me);
    }

    @PostMapping("/{team-id}/add-member")
    public TeamFullResponse addMember(@PathVariable(value = "team_id") Long teamId, @RequestBody UserCreateRequestForTeam userCreateRequestForTeam, Authentication authentication) {
        Team team = teamService.addMember(teamId, userCreateRequestForTeam);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @PutMapping("/{team-id}/remove-member/{user_id}")
    public TeamFullResponse addMember(@PathVariable(value = "team_id") Long teamId, @PathVariable(value = "user_id") Long userId, Authentication authentication) {
        Team team = teamService.removeMember(teamId, userId);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @PostMapping("/{team-id}/set-leader/{user_id}")
    public TeamFullResponse setLeader(@PathVariable(value = "team_id") Long teamId, @PathVariable(value = "user_id") Long userId, Authentication authentication) {
        Team team = teamService.setLeader(teamId, userId);

        return teamMapper.fromTeamToFullResponse(team);
    }
}
