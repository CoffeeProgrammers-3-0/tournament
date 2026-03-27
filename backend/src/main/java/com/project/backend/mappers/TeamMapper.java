package com.project.backend.mappers;

import com.project.backend.dto.team.*;
import com.project.backend.models.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class TeamMapper {
    @Autowired
    protected UserMapper userMapper;

    public abstract Team fromCreateRequestToTeam(TeamCreateRequest teamCreateRequest);
    public abstract Team fromUpdateRequestToTeam(TeamUpdateRequest teamUpdateRequest);

    public abstract TeamListResponse fromTeamToListResponse(Team team);
    @Mapping(target = "users", expression = "java(team.getTeamParticipants().stream().map(userMapper::fromTeamParticipantToResponseForTeam).toList())")
    public abstract TeamFullResponse fromTeamToFullResponse(Team team);
    public abstract TeamLeaderboardResponse fromTeamToLeaderboardResponse(Team team, Double points);

    @Mapping(target = "pointsPerJury", source = "pointsPerJury")
    @Mapping(target = "id", source = "team.id")
    @Mapping(target = "email", source = "team.email")
    @Mapping(target = "name", source = "team.name")
    public abstract StatisticResponse fromTeamToStatisticResponse(Team team, Map<String, Map<String, Integer>> pointsPerJury);
}
