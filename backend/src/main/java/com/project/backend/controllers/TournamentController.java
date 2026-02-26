package com.project.backend.controllers;

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
import com.project.backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;
    private final UserService userService;
    private final TournamentMapper tournamentMapper;

    @PostMapping
    public TournamentFullResponse create(@RequestBody TournamentCreateRequest tournamentCreateRequest, Authentication authentication) {
        Tournament tournament = tournamentService.create(tournamentMapper.fromCreateRequestToTournament(tournamentCreateRequest));

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }

    @PutMapping("/{tournament_id}")
    public TournamentFullResponse update(@PathVariable(value = "tournament_id") Long tournamentId, @RequestBody TournamentUpdateRequest tournamentUpdateRequest, Authentication authentication) {
        Tournament tournament = tournamentService.update(tournamentId, tournamentMapper.fromUpdateRequestToTournament(tournamentUpdateRequest));

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }

    @DeleteMapping("/{tournament_id}")
    public void delete(@PathVariable(value = "tournament_id") Long tournamentId, Authentication authentication) {
        tournamentService.delete(tournamentId);
    }

    @GetMapping
    public PaginationListResponse<TournamentListResponse> getAll(@RequestParam(value = "search") String search, @RequestParam(value = "page") Integer page, @RequestParam(value = "size") Integer size, @RequestParam(value = "status") TournamentStatus status) {
        Page<Tournament> tournamentPage = tournamentService.findAll(page, size, search, status);

        PaginationListResponse<TournamentListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(tournamentPage.getTotalPages());
        response.setContent(tournamentPage.getContent().stream().map(tournamentMapper::fromTournamentToListResponse).toList());

        return response;
    }

    @GetMapping("/my")
    public PaginationListResponse<TournamentListResponse> getAllMy(@RequestParam(value = "search") String search,
                                                                   @RequestParam(value = "page") Integer page,
                                                                   @RequestParam(value = "size") Integer size,
                                                                   @RequestParam(value = "status") TournamentStatus status,
                                                                   Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Page<Tournament> tournamentPage = tournamentService.findAllByUser(page, size, search, status, me);

        PaginationListResponse<TournamentListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(tournamentPage.getTotalPages());
        response.setContent(tournamentPage.getContent().stream().map(tournamentMapper::fromTournamentToListResponse).toList());

        return response;
    }

    @GetMapping("/available-for-me")
    public PaginationListResponse<TournamentListResponse> getAllAvailable(@RequestParam(value = "search") String search,
                                                                   @RequestParam(value = "page") Integer page,
                                                                   @RequestParam(value = "size") Integer size,
                                                                   Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Page<Tournament> tournamentPage = tournamentService.findAllByUserNot(page, size, search, null, me);

        PaginationListResponse<TournamentListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(tournamentPage.getTotalPages());
        response.setContent(tournamentPage.getContent().stream().map(tournamentMapper::fromTournamentToListResponse).toList());

        return response;
    }

    @GetMapping("/{tournament_id}")
    public TournamentFullResponse getById(@PathVariable(value = "tournament_id") Long tournamentId) {
        Tournament tournament = tournamentService.findById(tournamentId);

        return tournamentMapper.fromTournamentToFullResponse(tournament);
    }
}
