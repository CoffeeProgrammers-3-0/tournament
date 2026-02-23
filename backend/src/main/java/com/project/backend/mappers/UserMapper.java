package com.project.backend.mappers;

import com.project.backend.dto.user.*;
import com.project.backend.models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User fromUpdateRequestToUser(UserUpdateRequest userUpdateRequest);
    User fromCreateRequestToUser(UserCreateRequest userCreateRequest);
    User fromCreateRequestForTeamToUser(UserCreateRequestForTeam userCreateRequestForTeam);

    UserResponse fromUserToResponse(User user);
    UserResponseForTeam fromUserToResponseForTeam(User user, boolean isLeader);
}