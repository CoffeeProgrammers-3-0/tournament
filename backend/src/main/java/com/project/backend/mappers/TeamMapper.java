package com.project.backend.mappers;

import com.project.backend.dto.team.*;
import com.project.backend.dto.user.UserResponseForTeam;
import com.project.backend.models.Team;
import com.project.backend.models.join_tables.TeamParticipant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Map;

@Mapper(componentModel = "spring")
public interface TeamMapper {
    Team fromCreateRequestToTeam(TeamCreateRequest teamCreateRequest);
    Team fromUpdateRequestToTeam(TeamUpdateRequest teamUpdateRequest);

    TeamListResponse fromTeamToListResponse(Team team);
    @Mapping(target = "users", source = "teamParticipants")
    TeamFullResponse fromTeamToFullResponse(Team team);
    TeamLeaderboardResponse fromTeamToLeaderboardResponse(Team team, Double points);

    @Mapping(target = "pointsPerJury", source = "pointsPerJury")
    @Mapping(target = "id", source = "team.id")
    @Mapping(target = "email", source = "team.email")
    @Mapping(target = "name", source = "team.name")
    StatisticResponse fromTeamToStatisticResponse(Team team, Map<String, Map<String, Integer>> pointsPerJury);

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "isLeader", source = "isLeader")
    UserResponseForTeam fromParticipantToResponse(TeamParticipant participant);
}
