package com.project.backend.mappers;

import com.project.backend.dto.teamTask.TeamTaskFullResponse;
import com.project.backend.dto.teamTask.TeamTaskListResponse;
import com.project.backend.dto.teamTask.TeamTaskRequest;
import com.project.backend.models.TeamTask;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, TeamMapper.class, RoundMapper.class})
public interface TeamTaskMapper {
    TeamTask fromRequestToTeamTask(TeamTaskRequest teamTaskRequest);
    TeamTaskListResponse fromTeamTaskToListResponse(TeamTask teamTask);
    TeamTaskFullResponse fromTeamTaskToFullResponse(TeamTask teamTask);
}
