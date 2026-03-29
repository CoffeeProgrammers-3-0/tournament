package com.project.backend.services.implementations;

import com.project.backend.models.Round;
import com.project.backend.models.TeamTask;
import com.project.backend.models.User;
import com.project.backend.models.constants.TaskPriority;
import com.project.backend.models.constants.TaskStatus;
import com.project.backend.models.constants.TaskType;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.repositories.TeamTaskRepository;
import com.project.backend.repositories.UserRepository;
import com.project.backend.repositories.specifications.TeamSpecification;
import com.project.backend.repositories.specifications.TeamTaskSpecification;
import com.project.backend.services.interfaces.TeamTaskService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TeamTaskServiceImpl implements TeamTaskService {
    private final TeamTaskRepository teamTaskRepository;
    private final UserRepository userRepository;
    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;
    @Override
    @Transactional
    public TeamTask createTask(User creator, Long roundId, TeamTask teamTask) {
        Round round = roundRepository.getReferenceById(roundId);
        teamTask.setRound(round);
        teamTask.setCreator(creator);
        teamTask.setTeam(
                teamRepository.findOne(
                        Specification.allOf(
                                TeamSpecification.byRoundId(roundId),
                                TeamSpecification.byUserId(creator.getId())
                        )
                ).orElseThrow(() -> new EntityNotFoundException("Team for user with id " + creator.getId() + " for round with id " + roundId + " not found"))
        );
        teamTask.setStatus(teamTask.getStatus() == null ? TaskStatus.TODO : teamTask.getStatus());
        return teamTaskRepository.save(teamTask);
    }

    @Override
    @Transactional
    public TeamTask updateTask(Long teamTaskId, TeamTask teamTask) {
        TeamTask teamTaskToUpdate = teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));
        teamTaskToUpdate.setTitle(teamTask.getTitle());
        teamTaskToUpdate.setDescription(teamTask.getDescription());
        teamTaskToUpdate.setStatus(teamTaskToUpdate.getStatus() == null ? TaskStatus.TODO : teamTask.getStatus());
        teamTaskToUpdate.setType(teamTask.getType());
        teamTaskToUpdate.setPriority(teamTask.getPriority());
        return teamTaskRepository.save(teamTaskToUpdate);
    }

    @Override
    @Transactional
    public void deleteTask(Long teamTaskId) {
        teamTaskRepository.deleteById(teamTaskId);
    }

    @Override
    @Transactional
    public TeamTask updateTaskMeta(Long teamTaskId, TaskStatus status, TaskPriority priority, TaskType type) {
        TeamTask teamTaskToUpdate = teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));

        if (status != null) {
            teamTaskToUpdate.setStatus(status);
        }
        if (type != null) {
            teamTaskToUpdate.setType(type);
        }
        if (priority != null) {
            teamTaskToUpdate.setPriority(priority);
        }

        return teamTaskRepository.save(teamTaskToUpdate);
    }

    @Override
    @Transactional
    public TeamTask updateAssignee(Long teamTaskId, Long assigneeId) {
        TeamTask teamTaskToUpdate = teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));
        User assignee = userRepository.findById(assigneeId).orElseThrow(() -> new EntityNotFoundException("User with id " + assigneeId + " not found"));

        teamTaskToUpdate.setAssignee(assignee);

        return teamTaskRepository.save(teamTaskToUpdate);
    }

    @Override
    public Page<TeamTask> findAllByTeamIdAndRoundId(Integer page, Integer size, String search, User user, Long roundId, TaskStatus status, TaskType type, TaskPriority priority) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "priority"));
        return teamTaskRepository.findAll(
                Specification.allOf(
                        TeamTaskSpecification.byTitle(search),
                        TeamTaskSpecification.byUsersTeam(user.getId()),
                        TeamTaskSpecification.byRoundId(roundId),
                        TeamTaskSpecification.byStatus(status),
                        TeamTaskSpecification.byType(type),
                        TeamTaskSpecification.byPriority(priority)
                ),
                pageRequest
        );
    }

    @Override
    public Page<TeamTask> findAllForUser(Integer page, Integer size, String search, User user, TaskStatus status, TaskType type, TaskPriority priority) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "priority"));
        return teamTaskRepository.findAll(
                Specification.allOf(
                        TeamTaskSpecification.byTitle(search),
                        TeamTaskSpecification.byAssigneeId(user.getId()),
                        TeamTaskSpecification.byStatus(status),
                        TeamTaskSpecification.byType(type),
                        TeamTaskSpecification.byPriority(priority)
                ),
                pageRequest
        );
    }
}
