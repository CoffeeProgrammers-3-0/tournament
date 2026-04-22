package com.project.backend.mappers;

import com.project.backend.dto.team.TeamCreateRequest;
import com.project.backend.dto.team.TeamFullResponse;
import com.project.backend.dto.team.TeamListResponse;
import com.project.backend.dto.team.TeamUpdateRequest;
import com.project.backend.models.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class TeamMapper {
    @Autowired
    protected UserMapper userMapper;

    public abstract Team fromCreateRequestToTeam(TeamCreateRequest teamCreateRequest);
    public abstract Team fromUpdateRequestToTeam(TeamUpdateRequest teamUpdateRequest);

    public abstract TeamListResponse fromTeamToListResponse(Team team);
    @Mapping(target = "users", expression = "java(team.getTeamParticipants().stream().map(userMapper::fromTeamParticipantToResponseForTeam).toList())")
    public abstract TeamFullResponse fromTeamToFullResponse(Team team);
}
