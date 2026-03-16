package com.project.backend.controllers;

import com.project.backend.dto.team.*;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.TeamMapper;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.TeamService;
import com.project.backend.services.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/teams")
@Tag(name = "Teams", description = "API for managing teams and team members")
public class TeamController {
    private final TeamService teamService;
    private final UserService userService;
    private final TeamMapper teamMapper;

    @GetMapping("/check/{tournament_id}")
    @Operation(summary = "Check team registration", description = "Checks if the authenticated user is already registered in a team for the tournament")
    public boolean checkIfRegistered(
            @Parameter(description = "ID of the tournament", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);

        return teamService.check(tournamentId, me);
    }

    @PostMapping("/{tournament_id}")
    @Operation(summary = "Create team", description = "Creates a new team in the specified tournament")
    public TeamFullResponse create(
            @Parameter(description = "ID of the tournament", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId,

            @Parameter(description = "Team creation data")
            @RequestBody TeamCreateRequest teamCreateRequest,

            @Parameter(hidden = true)
            Authentication authentication) {
        Team team = teamService.create(
                tournamentId,
                teamCreateRequest.getUsers(),
                teamMapper.fromCreateRequestToTeam(teamCreateRequest)
        );

        return teamMapper.fromTeamToFullResponse(team);
    }

    @PutMapping("/{team_id}")
    @Operation(summary = "Update team", description = "Updates team information")
    public TeamFullResponse update(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(description = "Updated team data")
            @RequestBody TeamUpdateRequest teamUpdateRequest,

            @Parameter(hidden = true)
            Authentication authentication) {
        Team team = teamService.update(teamId, teamMapper.fromUpdateRequestToTeam(teamUpdateRequest));

        return teamMapper.fromTeamToFullResponse(team);
    }

    @DeleteMapping("/{team_id}")
    @Operation(summary = "Delete team", description = "Deletes a team by its ID")
    public void delete(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(hidden = true)
            Authentication authentication) {
        teamService.delete(teamId);
    }

    @GetMapping("/{team_id}")
    @Operation(summary = "Get team by ID", description = "Returns full information about a team")
    public TeamFullResponse getById(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Team team = teamService.findById(teamId);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @GetMapping
    @Operation(summary = "Get all teams", description = "Returns paginated list of teams with optional search")
    public PaginationListResponse<TeamListResponse> getAll(
            @Parameter(description = "Search teams by name", example = "Alpha")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size) {
        Page<Team> teamPage = teamService.findAll(page, size, search);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream()
                .map(teamMapper::fromTeamToListResponse)
                .toList());

        return response;
    }

    @GetMapping("/my")
    @Operation(summary = "Get my teams", description = "Returns paginated list of teams where the authenticated user participates")
    public PaginationListResponse<TeamListResponse> getAllMy(
            @Parameter(description = "Search teams by name", example = "Alpha")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Page<Team> teamPage = teamService.findAllByUser(me, page, size, search);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream()
                .map(teamMapper::fromTeamToListResponse)
                .toList());

        return response;
    }

    @GetMapping("/{team_id}/statistics/{round_id}")
    @Operation(summary = "Get team statistics", description = "Returns statistics of a team for a specific round")
    public StatisticResponse getStatsForTeam(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(description = "ID of the round", example = "2")
            @PathVariable(value = "round_id") Long roundId) {
        return teamService.getStatisticsByRoundForTeam(roundId, teamId);
    }

    @GetMapping("/statistics/{round_id}")
    @Operation(summary = "Get my team statistics", description = "Returns statistics for the authenticated user's team in the specified round")
    public StatisticResponse getStatsForMyTeam(
            @Parameter(description = "ID of the round", example = "2")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        return teamService.getStatisticsByRoundForUsersTeam(roundId, me);
    }

    @PostMapping("/{team_id}/members")
    @Operation(summary = "Add team member", description = "Adds a new member to the team")
    public TeamFullResponse addMember(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(description = "User data for new team member")
            @RequestBody UserCreateRequestForTeam userCreateRequestForTeam,

            @Parameter(hidden = true)
            Authentication authentication) {
        Team team = teamService.addMember(teamId, userCreateRequestForTeam);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @DeleteMapping("/{team_id}/members/{user_id}")
    @Operation(summary = "Remove team member", description = "Removes a user from the team")
    public TeamFullResponse removeMember(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(description = "ID of the user", example = "5")
            @PathVariable(value = "user_id") Long userId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Team team = teamService.removeMember(teamId, userId);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @PatchMapping("/{team_id}/set-leader/{user_id}")
    @Operation(summary = "Set team leader", description = "Sets a user as the leader of the team")
    public TeamFullResponse setLeader(
            @Parameter(description = "ID of the team", example = "10")
            @PathVariable(value = "team_id") Long teamId,

            @Parameter(description = "ID of the user who will become leader", example = "5")
            @PathVariable(value = "user_id") Long userId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Team team = teamService.setLeader(teamId, userId);

        return teamMapper.fromTeamToFullResponse(team);
    }

    @GetMapping("/tournament/{tournament_id}")
    @Operation(summary = "Get teams by tournament", description = "Returns paginated list of teams for the specified tournament")
    public PaginationListResponse<TeamListResponse> getAllByTournament(
            @Parameter(description = "Search teams by name", example = "Alpha")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "ID of the tournament", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId) {
        Page<Team> teamPage = teamService.findAllByTournament(page, size, search, tournamentId);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();
        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream()
                .map(teamMapper::fromTeamToListResponse)
                .toList());

        return response;
    }
}