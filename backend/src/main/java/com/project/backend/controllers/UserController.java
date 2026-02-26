package com.project.backend.controllers;

import com.project.backend.dto.user.UserCreateRequest;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.dto.user.UserUpdateRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.UserMapper;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping("/juries")
    public UserResponse createJury(@RequestBody UserCreateRequest userCreateRequest, Authentication authentication) {
        User user = userService.createJury(userMapper.fromCreateRequestToUser(userCreateRequest));

        return userMapper.fromUserToResponse(user);
    }

    @PutMapping("/{user_id}")
    public UserResponse update(@PathVariable(value = "user_id") Long userId, @RequestBody UserUpdateRequest userUpdateRequest, Authentication authentication) {
        User user = userService.updateUser(userMapper.fromUpdateRequestToUser(userUpdateRequest), userId);

        return userMapper.fromUserToResponse(user);
    }

    @DeleteMapping("/{user_id}")
    public void delete(@PathVariable(value = "user_id") Long userId, Authentication authentication) {
        userService.delete(userId);
    }

    @GetMapping("/my")
    public UserResponse my(Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        return userMapper.fromUserToResponse(me);
    }

    @GetMapping("/{user_id}")
    public UserResponse getByUserId(@PathVariable(value = "user_id") Long userId) {
        User user = userService.findById(userId);
        return userMapper.fromUserToResponse(user);
    }

    @GetMapping("/juries")
    public PaginationListResponse<UserResponse> getAll(@RequestParam(value = "query") String query, @RequestParam(value = "page") Integer page, @RequestParam(value = "size") Integer size, Authentication authentication) {
        Page<User> userPage = userService.findAllByRole(page, size, query, Role.JURY);

        PaginationListResponse<UserResponse> response = new PaginationListResponse<>();

        response.setTotalPages(userPage.getTotalPages());
        response.setContent(userPage.getContent().stream().map(userMapper::fromUserToResponse).toList());

        return response;
    }
}
