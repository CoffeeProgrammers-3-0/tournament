package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.adminMessage.AdminMessageRequest;
import com.project.backend.dto.adminMessage.RoundAdminMessageResponse;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.AdminMessageMapper;
import com.project.backend.models.User;
import com.project.backend.models.adminMessages.RoundAdminMessage;
import com.project.backend.services.interfaces.RoundAdminMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin-messages/round")
@RequiredArgsConstructor
@Tag(name = "Round Admin Messages", description = "API for managing round admin messages")
public class RoundAdminMessageController {

    private final RoundAdminMessageService roundAdminMessageService;
    private final AdminMessageMapper adminMessageMapper;
    private final CurrentUserContainer currentUserContainer;

    @GetMapping("/{round_id}")
    @Operation(
            summary = "Get all round admin messages by round",
            description = "Returns paginated list of round admin messages of a round"
    )
    public PaginationListResponse<RoundAdminMessageResponse> getAll(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Round ID", example = "1")
            @PathVariable(value = "round_id") Long roundId
    ) {
        Page<RoundAdminMessage> roundAdminMessages = roundAdminMessageService.findAll(page, size, roundId);

        PaginationListResponse<RoundAdminMessageResponse> response = new PaginationListResponse<>();

        response.setTotalPages(roundAdminMessages.getTotalPages());
        response.setContent(roundAdminMessages.getContent().stream()
                .map(adminMessageMapper::fromRoundAdminMessageToRoundResponse)
                .toList());

        return response;
    }

    @GetMapping("/my")
    @Operation(
            summary = "Get all round admin messages by user",
            description = "Returns paginated list of round admin messages of a user"
    )
    public PaginationListResponse<RoundAdminMessageResponse> getAll(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size
    ) {
        User me = currentUserContainer.getUser();
        Page<RoundAdminMessage> roundAdminMessages = roundAdminMessageService.findAllByUsersRounds(page, size, me);

        PaginationListResponse<RoundAdminMessageResponse> response = new PaginationListResponse<>();

        response.setTotalPages(roundAdminMessages.getTotalPages());
        response.setContent(roundAdminMessages.getContent().stream()
                .map(adminMessageMapper::fromRoundAdminMessageToRoundResponse)
                .toList());

        return response;
    }

    @PostMapping("/{round_id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create round admin message",
            description = "Creates a new round admin message (ADMIN only)"
    )
    public RoundAdminMessageResponse create(
            @RequestBody @Valid
            AdminMessageRequest request,

            @Parameter(description = "Round ID", example = "1")
            @PathVariable(value = "round_id") Long roundId
    ) {
        User me = currentUserContainer.getUser();
        return adminMessageMapper.fromRoundAdminMessageToRoundResponse(
                roundAdminMessageService.create(
                        adminMessageMapper.fromRequestToAdminMessage(request),
                        me,
                        roundId
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and @userSecurity.isCreatorOfAdminMessage(#id)")
    @Operation(
            summary = "Update round admin message",
            description = "Updates existing message (only creator ADMIN)"
    )
    public RoundAdminMessageResponse update(
            @Parameter(description = "Message ID", example = "1")
            @PathVariable Long id,

            @RequestBody @Valid
            AdminMessageRequest request
    ) {
        return adminMessageMapper.fromRoundAdminMessageToRoundResponse(
                roundAdminMessageService.update(
                        id,
                        adminMessageMapper.fromRequestToAdminMessage(request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and @userSecurity.isCreatorOfAdminMessage(#id)")
    @Operation(
            summary = "Delete round admin message",
            description = "Deletes message (only creator ADMIN)"
    )
    public void delete(
            @Parameter(description = "Message ID", example = "1")
            @PathVariable Long id
    ) {
        roundAdminMessageService.delete(id);
    }
}