package com.project.backend.services.interfaces;

import com.project.backend.models.TeamTask;
import com.project.backend.models.User;
import com.project.backend.models.constants.TaskPriority;
import com.project.backend.models.constants.TaskStatus;
import com.project.backend.models.constants.TaskType;
import org.springframework.data.domain.Page;

public interface TeamTaskService {

    TeamTask createTask(User creator, Long roundId, TeamTask teamTask);

    TeamTask updateTask(Long teamTaskId, TeamTask teamTask);

    void deleteTask(Long teamTaskId);

    TeamTask updateTaskMeta(Long teamTaskId, TaskStatus status, TaskPriority priority, TaskType type);

    TeamTask updateAssignee(Long teamTaskId, Long assigneeId);

    Page<TeamTask> findAllByTeamIdAndRoundId(Integer page, Integer size, String search, User user, Long roundId, TaskStatus status, TaskType type, TaskPriority priority);

    Page<TeamTask> findAllForUser(Integer page, Integer size, String search, User user, TaskStatus status, TaskType type, TaskPriority priority);

    TeamTask findById(Long teamTaskId);
}
