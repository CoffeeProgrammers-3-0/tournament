package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.tournament.TournamentCreateRequest;
import com.project.backend.dto.tournament.TournamentFullResponse;
import com.project.backend.dto.tournament.TournamentListResponse;
import com.project.backend.dto.tournament.TournamentUpdateRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.TournamentMapper;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.services.interfaces.TournamentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/tournaments")
@Tag(name = "Tournaments", description = "API for managing tournaments")
public class TournamentController {
    private final TournamentService tournamentService;
    private final TournamentMapper tournamentMapper;
    private final CurrentUserContainer currentUserContainer;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @Operation(summary = "Create tournament", description = "Creates a new tournament")
    public TournamentFullResponse create(
            @Parameter(description = "Tournament creation data")
            @RequestBody @Valid TournamentCreateRequest tournamentCreateRequest) {
        Tournament tournament = tournamentService.create(
                tournamentMapper.fromCreateRequestToTournament(tournamentCreateRequest)
        );

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{tournament_id}")
    @Operation(summary = "Update tournament", description = "Updates an existing tournament")
    public TournamentFullResponse update(
            @Parameter(description = "ID of the tournament to update", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId,

            @Parameter(description = "Updated tournament data")
            @RequestBody @Valid TournamentUpdateRequest tournamentUpdateRequest) {
        Tournament tournament = tournamentService.update(
                tournamentId,
                tournamentMapper.fromUpdateRequestToTournament(tournamentUpdateRequest)
        );

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{tournament_id}")
    @Operation(summary = "Delete tournament", description = "Deletes a tournament by its ID")
    public void delete(
            @Parameter(description = "ID of the tournament to delete", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId) {
        tournamentService.delete(tournamentId);
    }

    @GetMapping
    @Operation(summary = "Get tournaments", description = "Returns paginated list of tournaments with optional search and status filter")
    public PaginationListResponse<TournamentListResponse> getAll(
            @Parameter(description = "Search tournaments by name", example = "Hackathon")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Tournament status filter", example = "RUNNING")
            @RequestParam(value = "status", required = false) TournamentStatus status) {
        Page<Tournament> tournamentPage = tournamentService.findAll(page, size, search, status);

        PaginationListResponse<TournamentListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(tournamentPage.getTotalPages());
        response.setContent(
                tournamentPage.getContent()
                        .stream()
                        .map(tournamentMapper::fromTournamentToListResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/my")
    @Operation(summary = "Get my tournaments", description = "Returns paginated list of tournaments where user participate")
    public PaginationListResponse<TournamentListResponse> getAllMy(
            @Parameter(description = "Search tournaments by name", example = "Hackathon")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Tournament status filter", example = "RUNNING")
            @RequestParam(value = "status", required = false) TournamentStatus status) {
        User me = currentUserContainer.getUser();
        Page<Tournament> tournamentPage = tournamentService.findAllByUser(page, size, search, status, me);

        PaginationListResponse<TournamentListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(tournamentPage.getTotalPages());
        response.setContent(
                tournamentPage.getContent()
                        .stream()
                        .map(tournamentMapper::fromTournamentToListResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/available-for-me")
    @Operation(summary = "Get available tournaments", description = "Returns tournaments available for the authenticated user to join")
    public PaginationListResponse<TournamentListResponse> getAllAvailable(
            @Parameter(description = "Search tournaments by name", example = "Hackathon")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size) {
        User me = currentUserContainer.getUser();
        Page<Tournament> tournamentPage = tournamentService.findAllByUserNot(
                page,
                size,
                search,
                TournamentStatus.REGISTRATION,
                me
        );

        PaginationListResponse<TournamentListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(tournamentPage.getTotalPages());
        response.setContent(
                tournamentPage.getContent()
                        .stream()
                        .map(tournamentMapper::fromTournamentToListResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/{tournament_id}")
    @Operation(summary = "Get tournament by ID", description = "Returns detailed information about a tournament")
    public TournamentFullResponse getById(
            @Parameter(description = "ID of the tournament", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId) {
        Tournament tournament = tournamentService.findById(tournamentId);

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/{tournament_id}")
    @Operation(summary = "Get tournament by ID", description = "Returns detailed information about a tournament for admin")
    public TournamentFullResponse getByIdAdmin(
            @Parameter(description = "ID of the tournament", example = "1")
            @PathVariable(value = "tournament_id") Long tournamentId) {
        Tournament tournament = tournamentService.findByIdAdmin(tournamentId);

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }
}
