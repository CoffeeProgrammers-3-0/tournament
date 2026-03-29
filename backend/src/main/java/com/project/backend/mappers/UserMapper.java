package com.project.backend.mappers;

import com.project.backend.dto.user.*;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.TeamParticipant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User fromUpdateRequestToUser(UserUpdateRequest userUpdateRequest);
    User fromCreateRequestToUser(UserCreateRequest userCreateRequest);
    User fromCreateRequestForTeamToUser(UserCreateRequestForTeam userCreateRequestForTeam);

    UserResponse fromUserToResponse(User user);
    UserResponseForTeam fromUserToResponseForTeam(User user, boolean isLeader, Long tournamentId, String tournamentName);

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "tournamentId", source = "tournament.id")
    @Mapping(target = "tournamentName", source = "tournament.name")
    @Mapping(target = "tournamentStatus", source = "tournament.status")
    UserResponseForTeam fromTeamParticipantToResponseForTeam(TeamParticipant teamParticipant);

}