package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.teamTask.TeamTaskFullResponse;
import com.project.backend.dto.teamTask.TeamTaskListResponse;
import com.project.backend.dto.teamTask.TeamTaskRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.TeamTaskMapper;
import com.project.backend.models.TeamTask;
import com.project.backend.models.User;
import com.project.backend.models.constants.TaskPriority;
import com.project.backend.models.constants.TaskStatus;
import com.project.backend.models.constants.TaskType;
import com.project.backend.services.interfaces.TeamTaskService;
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
@RequestMapping("/api/team-tasks")
@Tag(name = "Team tasks", description = "API for managing todo list for team")
public class TeamTaskController {

    private final TeamTaskService teamTaskService;
    private final TeamTaskMapper teamTaskMapper;
    private final CurrentUserContainer currentUserContainer;

    @PreAuthorize("@userSecurity.isMemberOfTheTeamInRound(#roundId)")
    @PostMapping("/{round_id}")
    @Operation(summary = "Create team task", description = "Creates a new task for a team")
    public TeamTaskListResponse createTask(
            @Parameter(description = "ID of the round", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Team task creation request")
            @RequestBody @Valid TeamTaskRequest teamTaskRequest) {
        User creator = currentUserContainer.getUser();
        return teamTaskMapper.fromTeamTaskToListResponse(
                teamTaskService.createTask(creator, roundId, teamTaskMapper.fromRequestToTeamTask(teamTaskRequest))
        );
    }

    @PreAuthorize("@userSecurity.isMemberOfTheTeamOfTheTeamTask(#teamTaskId)")
    @PutMapping("/{team_task_id}")
    @Operation(summary = "Update team task", description = "Updates an existing task")
    public TeamTaskListResponse updateTask(
            @Parameter(description = "ID of the team task", example = "1")
            @PathVariable(value = "team_task_id") Long teamTaskId,

            @Parameter(description = "Team task update request")
            @RequestBody @Valid TeamTaskRequest teamTaskRequest) {
        return teamTaskMapper.fromTeamTaskToListResponse(
                teamTaskService.updateTask(teamTaskId, teamTaskMapper.fromRequestToTeamTask(teamTaskRequest))
        );
    }

    @PreAuthorize("@userSecurity.isMemberOfTheTeamOfTheTeamTask(#teamTaskId)")
    @DeleteMapping("/{team_task_id}")
    @Operation(summary = "Delete team task", description = "Deletes a task by its ID")
    public void deleteTask(
            @Parameter(description = "ID of the team task", example = "1")
            @PathVariable(value = "team_task_id") Long teamTaskId) {
        teamTaskService.deleteTask(teamTaskId);
    }

    @PreAuthorize("@userSecurity.isMemberOfTheTeamOfTheTeamTask(#teamTaskId)")
    @GetMapping("/{team_task_id}")
    @Operation(summary = "Get team task", description = "Gets a task by its ID")
    public TeamTaskFullResponse getTask(
            @Parameter(description = "ID of the team task", example = "1")
            @PathVariable(value = "team_task_id") Long teamTaskId) {
        return teamTaskMapper.fromTeamTaskToFullResponse(teamTaskService.findById(teamTaskId));
    }

    @PreAuthorize("@userSecurity.isMemberOfTheTeamOfTheTeamTask(#teamTaskId)")
    @PatchMapping("/{team_task_id}/update-meta")
    @Operation(summary = "Update task meta", description = "Updates status, priority, or type of the task")
    public TeamTaskListResponse updateTaskMeta(
            @Parameter(description = "ID of the team task", example = "1")
            @PathVariable(value = "team_task_id") Long teamTaskId,

            @Parameter(description = "Task status filter", example = "TODO")
            @RequestParam(required = false) TaskStatus status,

            @Parameter(description = "Task priority filter", example = "HIGH")
            @RequestParam(required = false) TaskPriority priority,

            @Parameter(description = "Task type filter", example = "BUG")
            @RequestParam(required = false) TaskType type) {
        return teamTaskMapper.fromTeamTaskToListResponse(
                teamTaskService.updateTaskMeta(teamTaskId, status, priority, type)
        );
    }

    @PreAuthorize("@userSecurity.isMemberOfTheTeamOfTheTeamTask(#teamTaskId)")
    @PatchMapping("/{team_task_id}/assign/{assignee_id}")
    @Operation(summary = "Assign task", description = "Assigns a user to the task")
    public TeamTaskListResponse updateAssignee(
            @Parameter(description = "ID of the team task", example = "1")
            @PathVariable(value = "team_task_id") Long teamTaskId,

            @Parameter(description = "ID of the assignee", example = "2")
            @PathVariable(value = "assignee_id") Long assigneeId) {
        return teamTaskMapper.fromTeamTaskToListResponse(
                teamTaskService.updateAssignee(teamTaskId, assigneeId)
        );
    }

    @PreAuthorize("@userSecurity.isMemberOfTheTeamInRound(#roundId)")
    @GetMapping("/round/{round_id}/my")
    @Operation(summary = "Get tasks for my team and round", description = "Returns paginated list of tasks for the authenticated user's team in the given round")
    public PaginationListResponse<TeamTaskListResponse> getTasksForMyTeamAndRound(
            @Parameter(description = "ID of the round", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Search tasks by title", example = "Fix bug")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Task status filter", example = "TODO")
            @RequestParam(value = "status", required = false) TaskStatus status,

            @Parameter(description = "Task type filter", example = "BUG")
            @RequestParam(value = "type", required = false) TaskType type,

            @Parameter(description = "Task priority filter", example = "HIGH")
            @RequestParam(value = "priority", required = false) TaskPriority priority) {
        User me = currentUserContainer.getUser();
        Page<TeamTask> teamTaskPage = teamTaskService.findAllByTeamIdAndRoundId(page, size, search, me, roundId, status, type, priority);

        PaginationListResponse<TeamTaskListResponse> response = new PaginationListResponse<>();
        response.setTotalPages(teamTaskPage.getTotalPages());
        response.setContent(teamTaskPage.getContent().stream()
                .map(teamTaskMapper::fromTeamTaskToListResponse)
                .toList());
        return response;
    }

    @GetMapping("/my")
    @Operation(summary = "Get my tasks", description = "Returns paginated list of tasks assigned to the authenticated user")
    public PaginationListResponse<TeamTaskListResponse> getMyTasks(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Search tasks by title", example = "Fix bug")
            @RequestParam(value = "search", required = false) String search,

            @Parameter(description = "Task status filter", example = "TODO")
            @RequestParam(value = "status", required = false) TaskStatus status,

            @Parameter(description = "Task type filter", example = "BUG")
            @RequestParam(value = "type", required = false) TaskType type,

            @Parameter(description = "Task priority filter", example = "HIGH")
            @RequestParam(value = "priority", required = false) TaskPriority priority) {
        User me = currentUserContainer.getUser();
        Page<TeamTask> teamTaskPage = teamTaskService.findAllForUser(page, size, search, me, status, type, priority);

        PaginationListResponse<TeamTaskListResponse> response = new PaginationListResponse<>();
        response.setTotalPages(teamTaskPage.getTotalPages());
        response.setContent(teamTaskPage.getContent().stream()
                .map(teamTaskMapper::fromTeamTaskToListResponse)
                .toList());
        return response;
    }
}