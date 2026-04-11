package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.roundEvent.RoundEventFullResponse;
import com.project.backend.dto.roundEvent.RoundEventListResponse;
import com.project.backend.dto.roundEvent.RoundEventRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.RoundEventMapper;
import com.project.backend.models.RoundEvent;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.RoundEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/round-events")
@RequiredArgsConstructor
@Tag(name = "Round Events", description = "API for managing round events")
public class RoundEventController {

    private final RoundEventService roundEventService;
    private final RoundEventMapper roundEventMapper;
    private final CurrentUserContainer currentUserContainer;

    @GetMapping("/round/{round_id}")
    @Operation(
            summary = "Get all round events by round",
            description = "Returns paginated list of round events of a round"
    )
    public PaginationListResponse<RoundEventListResponse> getAll(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Round ID", example = "1")
            @PathVariable(value = "round_id") Long roundId
    ) {
        Page<RoundEvent> roundAdminMessages = roundEventService.findAll(page, size, roundId);

        PaginationListResponse<RoundEventListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(roundAdminMessages.getTotalPages());
        response.setContent(roundAdminMessages.getContent().stream()
                .map(roundEventMapper::fromRoundEventToListResponse)
                .toList());

        return response;
    }

    @GetMapping("/{round_event_id}")
    @Operation(
            summary = "Get round event by id",
            description = "Returns full info of round event by id"
    )
    public RoundEventFullResponse getById(
            @Parameter(description = "Round event ID", example = "1")
            @PathVariable(value = "round_event_id") Long roundEventId
    ) {
        return roundEventMapper.fromRoundEventToFullResponse(roundEventService.findById(roundEventId));
    }

    @PostMapping("/{round_id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create round admin message",
            description = "Creates a new round admin message (ADMIN only)"
    )
    public RoundEventFullResponse create(
            @RequestBody @Valid
            RoundEventRequest request,

            @Parameter(description = "Round ID", example = "1")
            @PathVariable(value = "round_id") Long roundId
    ) {
        User me = currentUserContainer.getUser();
        return roundEventMapper.fromRoundEventToFullResponse(
                roundEventService.create(
                        roundEventMapper.fromRequestToRoundEvent(request),
                        me,
                        roundId
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and @userSecurity.isCreatorOfRoundEvent(#id)")
    @Operation(
            summary = "Update round admin message",
            description = "Updates existing message (only creator ADMIN)"
    )
    public RoundEventFullResponse update(
            @Parameter(description = "Message ID", example = "1")
            @PathVariable Long id,

            @RequestBody @Valid
            RoundEventRequest request
    ) {
        return roundEventMapper.fromRoundEventToFullResponse(
                roundEventService.update(
                        id,
                        roundEventMapper.fromRequestToRoundEvent(request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and @userSecurity.isCreatorOfRoundEvent(#id)")
    @Operation(
            summary = "Delete round event",
            description = "Deletes round event (only creator ADMIN)"
    )
    public void delete(
            @Parameter(description = "Round event ID", example = "1")
            @PathVariable Long id
    ) {
        roundEventService.delete(id);
    }
}