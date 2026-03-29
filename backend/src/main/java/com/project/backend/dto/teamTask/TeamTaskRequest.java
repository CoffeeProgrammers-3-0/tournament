package com.project.backend.dto.teamTask;

import com.project.backend.models.constants.TaskPriority;
import com.project.backend.models.constants.TaskStatus;
import com.project.backend.models.constants.TaskType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "TeamTaskRequest", description = "DTO for creating or updating a team task")
public class TeamTaskRequest {

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