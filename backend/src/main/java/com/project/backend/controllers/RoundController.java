package com.project.backend.controllers;

import com.project.backend.dto.round.RoundCreateRequest;
import com.project.backend.dto.round.RoundFullResponse;
import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.round.RoundUpdateRequest;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.dto.team.TeamListResponse;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.RoundMapper;
import com.project.backend.mappers.TeamMapper;
import com.project.backend.mappers.UserMapper;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.services.interfaces.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/tournaments")
@Tag(name = "Rounds", description = "API for managing tournament rounds")
public class RoundController {
    private final RoundService roundService;
    private final RoundMapper roundMapper;
    private final EvaluationService evaluationService;
    private final TeamService teamService;
    private final UserService userService;
    private final TeamMapper teamMapper;
    private final UserMapper userMapper;
    private final ExcelExportService excelExportService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{tournament_id}/rounds")
    @Operation(summary = "Create round", description = "Creates a new round inside the specified tournament")
    public RoundFullResponse create(
            @Parameter(description = "ID of the tournament where the round will be created", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId,

            @Parameter(description = "Round creation data")
            @RequestBody @Valid RoundCreateRequest roundCreateRequest) {
        Round round = roundService.create(
                tournamentId,
                roundMapper.fromCreateRequestToRound(roundCreateRequest)
        );

        return roundMapper.fromRoundToFullResponse(round);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/rounds/{round_id}")
    @Operation(summary = "Update round", description = "Updates an existing round")
    public RoundFullResponse update(
            @Parameter(description = "ID of the round to update", example = "10")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Updated round data")
            @RequestBody @Valid RoundUpdateRequest roundUpdateRequest) {
        Round round = roundService.update(
                roundId,
                roundMapper.fromUpdateRequestToRound(roundUpdateRequest)
        );

        return roundMapper.fromRoundToFullResponse(round);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/rounds/{round_id}")
    @Operation(summary = "Delete round", description = "Deletes a round by its ID")
    public void delete(
            @Parameter(description = "ID of the round to delete", example = "10")
            @PathVariable(value = "round_id") Long roundId) {

        roundService.delete(roundId);
    }

    @GetMapping("/{tournament_id}/rounds")
    @Operation(summary = "Get tournament rounds", description = "Returns paginated list of rounds for a tournament with optional search and filtering by status")
    public PaginationListResponse<RoundListResponse> getAllByTournament(
            @Parameter(description = "Search rounds by name", example = "Final")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Round status filter", example = "ACTIVE")
            @RequestParam(value = "status") RoundStatus status,

            @Parameter(description = "ID of the tournament", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId) {

        Page<Round> roundPage = roundService.findAllByTournament(
                tournamentId,
                page,
                size,
                search,
                status
        );

        PaginationListResponse<RoundListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(roundPage.getTotalPages());
        response.setContent(
                roundPage.getContent()
                        .stream()
                        .map(roundMapper::fromRoundToListResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/rounds-by-round/{round_id}")
    @Operation(summary = "Get tournament rounds", description = "Returns paginated list of rounds for a tournament with optional search and filtering by status found by round in the same tournament")
    public PaginationListResponse<RoundListResponse> getAllByRound(
            @Parameter(description = "Search rounds by name", example = "Final")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Round status filter", example = "ACTIVE")
            @RequestParam(value = "status") RoundStatus status,

            @Parameter(description = "ID of the round", example = "1")
            @PathVariable(value = "round_id") Long round_id) {

        Page<Round> roundPage = roundService.findAllByRoundInSameTournament(
                round_id,
                page,
                size,
                search,
                status
        );

        PaginationListResponse<RoundListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(roundPage.getTotalPages());
        response.setContent(
                roundPage.getContent()
                        .stream()
                        .map(roundMapper::fromRoundToListResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/rounds/{round_id}")
    @Operation(summary = "Get round by ID", description = "Returns detailed information about a round")
    public RoundFullResponse getById(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId) {
        Round round = roundService.findById(roundId);

        return roundMapper.fromRoundToFullResponse(round);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/rounds/{round_id}/juries/{jury_id}")
    @Operation(summary = "Assign jury to round", description = "Assigns a jury member to the specified round")
    public void setJury(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "ID of the jury user", example = "3")
            @PathVariable(value = "jury_id") Long juryId) {
        roundService.setJury(roundId, juryId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/rounds/{round_id}/juries/{jury_id}")
    @Operation(summary = "Remove jury from round", description = "Removes a jury member from the specified round")
    public void removeJury(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "ID of the jury user", example = "3")
            @PathVariable(value = "jury_id") Long juryId) {
        roundService.removeJury(roundId, juryId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/rounds/{round_id}/auto-assign-juries")
    @Operation(summary = "Auto assign juries", description = "Automatically assigns submissions to jury members for evaluation")
    public void autoAssignJuries(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Number of jury members per submission", example = "3")
            @RequestParam(value = "k") int k) {
        evaluationService.assignSubmissionsToJury(roundId, k);
    }

    @GetMapping("/rounds/{round_id}/leaderboard")
    @Operation(summary = "Get my team statistics", description = "Returns leaderboard for the round")
    public List<TeamLeaderboardResponse> getLeaderboardForRound(
            @Parameter(description = "ID of the round", example = "2")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Points of the last team visible in leaderboard", example = "2.5")
            @RequestParam(value = "last_team_points") Double lastTeamPoints,

            @Parameter(description = "Id of the last team visible in leaderboard", example = "3")
            @RequestParam(value = "last_team_id") Long lastTeamId,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size) {
        return teamService.getAllStatsByRoundId(roundId, lastTeamPoints, lastTeamId, size);
    }

    @GetMapping("/rounds/{round_id}/leaderboard/export")
    @Operation(summary = "Returns an excel file with leaderboard", description = "Returns excel with leaderboard for the round")
    public ResponseEntity<Resource> downloadScores(
            @Parameter(description = "ID of the round", example = "2")
            @PathVariable(value = "round_id") Long roundId
    ) throws IOException {
        List<TeamLeaderboardResponse> data = teamService.getAllStatsByRoundId(roundId);
        byte[] excelBytes = excelExportService.exportToExcel(data);

        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=round_"+roundId+".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    @GetMapping("/rounds/{round_id}/juries")
    @Operation(summary = "Get all juries by round", description = "Returns paginated list of users with JURY role by round")
    public PaginationListResponse<UserResponse> getAllJuriesByRound(
            @Parameter(description = "Search query for jury users", example = "john")
            @RequestParam(value = "query", required = false) String query,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Round id", example = "1")
            @PathVariable(value = "round_id") Long roundId) {
        Page<User> userPage = userService.findAllJuriesUsersForRound(page, size, query, roundId);

        PaginationListResponse<UserResponse> response = new PaginationListResponse<>();

        response.setTotalPages(userPage.getTotalPages());
        response.setContent(
                userPage.getContent()
                        .stream()
                        .map(userMapper::fromUserToResponse)
                        .toList()
        );

        return response;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/rounds/{round_id}/assign-teams")
    @Operation(summary = "Assign teams to round", description = "Assigns teams to an existing round")
    public void assignTeams(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "IDs of the teams")
            @RequestParam(value = "team_ids") List<Long> teamIds) {
        roundService.assignTeams(
                roundId,
                teamIds
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/rounds/{round_id}/unassign-teams")
    @Operation(summary = "Unassign teams from round", description = "Unassigns teams from an existing round")
    public void unassignTeams(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "IDs of the teams")
            @RequestParam(value = "team_ids") List<Long> teamIds) {
        roundService.unassignTeams(
                roundId,
                teamIds
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/rounds/{round_id}/assign-all-teams")
    @Operation(summary = "Assign all teams to round", description = "Assigns all teams of tournament to an existing round")
    public void assignTeams(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId) {
        roundService.assignAllTeams(
                roundId
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/rounds/{round_id}/unassign-all-teams")
    @Operation(summary = "Unassign all teams from round", description = "Unassigns all teams of the tournament from an existing round")
    public void unassignTeams(
            @Parameter(description = "ID of the round", example = "10")
            @PathVariable(value = "round_id") Long roundId) {
        roundService.unassignAllTeams(
                roundId
        );
    }

    @GetMapping("/rounds/{round_id}/teams")
    @Operation(summary = "Get teams by round", description = "Returns paginated list of teams for the specified round")
    public PaginationListResponse<TeamListResponse> getAllTeamsByRound(
            @Parameter(description = "Search teams by name", example = "Alpha")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "ID of the round", example = "1")
            @PathVariable(value = "round_id") Long roundId) {
        Page<Team> teamPage = teamService.findAllByRound(page, size, search, roundId);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();
        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream()
                .map(teamMapper::fromTeamToListResponse)
                .toList());

        return response;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/rounds/{round_id}/not-teams")
    @Operation(summary = "Get teams by round not", description = "Returns paginated list of teams for the specified round")
    public PaginationListResponse<TeamListResponse> getAllTeamsByRoundNot(
            @Parameter(description = "Search teams by name", example = "Alpha")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "ID of the round", example = "1")
            @PathVariable(value = "round_id") Long roundId) {
        Page<Team> teamPage = teamService.findAllByRoundNot(page, size, search, roundId);

        PaginationListResponse<TeamListResponse> response = new PaginationListResponse<>();
        response.setTotalPages(teamPage.getTotalPages());
        response.setContent(teamPage.getContent().stream()
                .map(teamMapper::fromTeamToListResponse)
                .toList());

        return response;
    }
}