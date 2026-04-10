package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.adminMessage.AdminMessageRequest;
import com.project.backend.dto.adminMessage.GlobalAdminMessageResponse;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.AdminMessageMapper;
import com.project.backend.models.User;
import com.project.backend.models.adminMessages.GlobalAdminMessage;
import com.project.backend.services.interfaces.GlobalAdminMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin-messages/global")
@RequiredArgsConstructor
@Tag(name = "Global Admin Messages", description = "API for managing global admin messages")
public class GlobalAdminMessageController {

    private final GlobalAdminMessageService globalAdminMessageService;
    private final AdminMessageMapper adminMessageMapper;
    private final CurrentUserContainer currentUserContainer;

    @GetMapping
    @Operation(
            summary = "Get all global admin messages",
            description = "Returns paginated list of global admin messages"
    )
    public PaginationListResponse<GlobalAdminMessageResponse> getAll(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size
    ) {
        Page<GlobalAdminMessage> globalAdminMessagePage = globalAdminMessageService.findAll(page, size);

        PaginationListResponse<GlobalAdminMessageResponse> response = new PaginationListResponse<>();

        response.setTotalPages(globalAdminMessagePage.getTotalPages());
        response.setContent(globalAdminMessagePage.getContent().stream()
                .map(adminMessageMapper::fromGlobalAdminMessageToGlobalResponse)
                .toList());

        return response;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create global admin message",
            description = "Creates a new global admin message (ADMIN only)"
    )
    public GlobalAdminMessageResponse create(
            @RequestBody @Valid
            AdminMessageRequest request
    ) {
        User me = currentUserContainer.getUser();
        return adminMessageMapper.fromGlobalAdminMessageToGlobalResponse(
                globalAdminMessageService.create(
                        adminMessageMapper.fromRequestToAdminMessage(request),
                        me
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and @userSecurity.isCreatorOfAdminMessage(#id)")
    @Operation(
            summary = "Update global admin message",
            description = "Updates existing message (only creator ADMIN)"
    )
    public GlobalAdminMessageResponse update(
            @Parameter(description = "Message ID", example = "1")
            @PathVariable Long id,

            @RequestBody @Valid
            AdminMessageRequest request
    ) {
        return adminMessageMapper.fromGlobalAdminMessageToGlobalResponse(
                globalAdminMessageService.update(
                        id,
                        adminMessageMapper.fromRequestToAdminMessage(request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and @userSecurity.isCreatorOfAdminMessage(#id)")
    @Operation(
            summary = "Delete global admin message",
            description = "Deletes message (only creator ADMIN)"
    )
    public void delete(
            @Parameter(description = "Message ID", example = "1")
            @PathVariable Long id
    ) {
        globalAdminMessageService.delete(id);
    }
}