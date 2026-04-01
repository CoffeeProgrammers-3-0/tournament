package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.user.UserCreateRequest;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.dto.user.UserUpdateRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.UserMapper;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.services.interfaces.UserService;
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
@RequestMapping("/api/users")
@Tag(name = "Users", description = "API for managing users and juries")
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final CurrentUserContainer currentUserContainer;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/juries")
    @Operation(summary = "Create jury user", description = "Creates a new user with JURY role")
    public UserResponse createJury(
            @Parameter(description = "User creation data")
            @RequestBody @Valid UserCreateRequest userCreateRequest) {
        User user = userService.createUser(
                userMapper.fromCreateRequestToUser(userCreateRequest),
                Role.JURY
        );

        return userMapper.fromUserToResponse(user);
    }

    @PreAuthorize("@userSecurity.checkUser(#userId) or hasRole('ADMIN')")
    @PutMapping("/{user_id}")
    @Operation(summary = "Update user", description = "Updates user information")
    public UserResponse update(
            @Parameter(description = "ID of the user to update", example = "1")
            @PathVariable(value = "user_id") Long userId,

            @Parameter(description = "Updated user data")
            @RequestBody @Valid UserUpdateRequest userUpdateRequest) {
        User user = userService.updateUser(
                userMapper.fromUpdateRequestToUser(userUpdateRequest),
                userId
        );

        return userMapper.fromUserToResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{user_id}")
    @Operation(summary = "Delete user", description = "Deletes a user by ID")
    public void delete(
            @Parameter(description = "ID of the user to delete", example = "1")
            @PathVariable(value = "user_id") Long userId) {
        userService.delete(userId);
    }

    @GetMapping("/my")
    @Operation(summary = "Get my profile", description = "Returns profile of the authenticated user")
    public UserResponse my() {
        User me = currentUserContainer.getUser();
        return userMapper.fromUserToResponse(me);
    }

    @GetMapping("/{user_id}")
    @Operation(summary = "Get user by ID", description = "Returns user details by ID")
    public UserResponse getByUserId(
            @Parameter(description = "ID of the user", example = "1")
            @PathVariable(value = "user_id") Long userId) {
        User user = userService.findById(userId);
        return userMapper.fromUserToResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/juries")
    @Operation(summary = "Get all juries", description = "Returns paginated list of users with JURY role")
    public PaginationListResponse<UserResponse> getAll(
            @Parameter(description = "Search query for jury users", example = "john")
            @RequestParam(value = "query", required = false) String query,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size) {
        Page<User> userPage = userService.findAllByRole(page, size, query, Role.JURY);

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
}