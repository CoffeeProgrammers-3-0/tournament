package com.project.backend.dto.teamTask;

import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.team.TeamListResponse;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.models.constants.TaskPriority;
import com.project.backend.models.constants.TaskStatus;
import com.project.backend.models.constants.TaskType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "TeamTaskFullResponse", description = "DTO representing a team task full info")
public class TeamTaskResponse {

    @Schema(description = "ID of the task", example = "1")
    private Long id;

    @Schema(description = "Team associated with the task")
    private TeamListResponse team;

    @Schema(description = "Round associated with the task")
    private RoundListResponse round;

    @Schema(description = "User who created the task")
    private UserResponse creator;

    @Schema(description = "User assigned to the task (if any)")
    private UserResponse assignee;

    @Schema(description = "Title of the task", example = "Fix login bug")
    private String title;

    @Schema(description = "Detailed description of the task", example = "User cannot login with Google OAuth")
    private String description;

    @Schema(description = "Current status of the task", example = "TODO")
    private TaskStatus status;

    @Schema(description = "Type of the task", example = "BUG")
    private TaskType type;

    @Schema(description = "Priority level of the task", example = "HIGH")
    private TaskPriority priority;
}