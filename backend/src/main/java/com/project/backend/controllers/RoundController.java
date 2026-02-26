package com.project.backend.controllers;

import com.project.backend.dto.round.RoundCreateRequest;
import com.project.backend.dto.round.RoundFullResponse;
import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.round.RoundUpdateRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.RoundMapper;
import com.project.backend.models.Round;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.services.interfaces.RoundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/tournaments")
public class RoundController {
    private final RoundService roundService;
    private final RoundMapper roundMapper;

    @PostMapping("/{tournament_id}/rounds")
    public RoundFullResponse create(@PathVariable(value = "tournament_id") Long tournamentId, @RequestBody RoundCreateRequest roundCreateRequest) {
        Round round = roundService.create(tournamentId, roundMapper.fromCreateRequestToRound(roundCreateRequest));

        return roundMapper.fromRoundToFullResponse(round);
    }

    @PutMapping("/rounds/{round_id}")
    public RoundFullResponse update(@PathVariable(value = "round_id") Long roundId, @RequestBody RoundUpdateRequest roundUpdateRequest) {
        Round round = roundService.update(roundId, roundMapper.fromUpdateRequestToRound(roundUpdateRequest));

        return roundMapper.fromRoundToFullResponse(round);
    }

    @DeleteMapping("/rounds/{round_id}")
    public void delete(@PathVariable(value = "round_id") Long roundId) {
        roundService.delete(roundId);
    }

    @GetMapping("/{tournament_id}/rounds")
    public PaginationListResponse<RoundListResponse> getAllByTournament(@RequestParam(value = "search") String search, @RequestParam(value = "page") Integer page, @RequestParam(value = "size") Integer size, @RequestParam(value = "status") RoundStatus status, @PathVariable(value = "tournament_id") Long tournamentId) {
        Page<Round> roundPage = roundService.findAllByTournament(tournamentId, page, size, search, status);

        PaginationListResponse<RoundListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(roundPage.getTotalPages());
        response.setContent(roundPage.getContent().stream().map(roundMapper::fromRoundToListResponse).toList());

        return response;
    }

    @GetMapping("/rounds/{round_id}")
    public RoundFullResponse getById(@PathVariable(value = "round_id") Long roundId) {
        Round round = roundService.findById(roundId);

        return roundMapper.fromRoundToFullResponse(round);
    }

    @PostMapping("/rounds/{round_id}/set-jury/{jury_id}")
    public void getById(@PathVariable(value = "round_id") Long roundId, @PathVariable(value = "jury_id") Long juryId) {
        roundService.setJury(roundId, juryId);
    }
}
