package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.notification.NotificationResponse;
import com.project.backend.dto.wrapper.LongDTO;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.NotificationMapper;
import com.project.backend.models.Notification;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "API for managing notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;
    private final CurrentUserContainer currentUserContainer;

    @GetMapping("/my")
    @Operation(
            summary = "Get notifications for an authenticated user",
            description = "Returns paginated list of notifications for an authenticated user"
    )
    public PaginationListResponse<NotificationResponse> getAll(@RequestParam(value = "page") Integer page, @RequestParam(value = "size") Integer size) {
        User me = currentUserContainer.getUser();

        Page<Notification> notificationPage = notificationService.findAllByUser(page, size, me);

        PaginationListResponse<NotificationResponse> response = new PaginationListResponse<>();

        response.setTotalPages(notificationPage.getTotalPages());
        response.setContent(notificationPage.getContent().stream().map(notificationMapper::fromNotificationToResponse).toList());

        return response;
    }

    @GetMapping("/unseen-count")
    @Operation(
            summary = "Get count of unseen notifications of an authenticated user",
            description = "Returns count of unseen notifications of an authenticated user"
    )
    public LongDTO getUnseen() {
        User me = currentUserContainer.getUser();

        Long count = notificationService.countUnseenByUser(me);

        LongDTO response = new LongDTO();
        response.setValue(count);

        return response;
    }
}
