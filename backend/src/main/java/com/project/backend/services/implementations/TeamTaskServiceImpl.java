package com.project.backend.services.implementations;

import com.project.backend.dto.event.TeamTaskCreatedEvent;
import com.project.backend.dto.event.TeamTaskDeletedEvent;
import com.project.backend.dto.event.TeamTaskUpdatedEvent;
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
import org.springframework.context.ApplicationEventPublisher;
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

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public TeamTask createTask(User creator, Long roundId, TeamTask teamTask) {
        if (creator == null) {
            throw new IllegalArgumentException("Creator cannot be null");
        }
        if (roundId == null) {
            throw new IllegalArgumentException("RoundId cannot be null");
        }
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));

        if (teamTask.getTitle() == null || teamTask.getTitle().isBlank()) {
            throw new IllegalArgumentException("Task title cannot be empty");
        }

        teamTask.setRound(round);
        teamTask.setCreator(creator);
        teamTask.setTeam(
                teamRepository.findOne(
                        Specification.allOf(
                                TeamSpecification.byRoundId(roundId),
                                TeamSpecification.byUserId(creator.getId())
                        )
                ).orElseThrow(() -> new EntityNotFoundException(
                        "Team for user with id " + creator.getId() + " for round with id " + roundId + " not found"))
        );
        teamTask.setStatus(teamTask.getStatus() == null ? TaskStatus.TODO : teamTask.getStatus());

        teamTask = teamTaskRepository.save(teamTask);

        TeamTaskCreatedEvent event = new TeamTaskCreatedEvent(teamTask);
        eventPublisher.publishEvent(event);

        return teamTask;
    }

    @Override
    @Transactional
    public TeamTask updateTask(Long teamTaskId, TeamTask teamTask) {
        TeamTask teamTaskToUpdate = teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));
        teamTaskToUpdate.setTitle(teamTask.getTitle());
        teamTaskToUpdate.setDescription(teamTask.getDescription());
        teamTaskToUpdate.setStatus(teamTask.getStatus() == null ? teamTaskToUpdate.getStatus() : teamTask.getStatus());
        teamTaskToUpdate.setType(teamTask.getType() == null ? teamTaskToUpdate.getType() : teamTask.getType());
        teamTaskToUpdate.setPriority(teamTask.getPriority() == null ? teamTaskToUpdate.getPriority() : teamTask.getPriority());


        TeamTaskUpdatedEvent event = new TeamTaskUpdatedEvent(teamTask);
        eventPublisher.publishEvent(event);

        return teamTaskRepository.save(teamTaskToUpdate);
    }

    @Override
    @Transactional
    public void deleteTask(Long teamTaskId) {
        TeamTask teamTask = teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));
        TeamTaskDeletedEvent event = new TeamTaskDeletedEvent(teamTask.getTeam(), teamTask.getRound(), teamTask.getAssignee(), teamTask.getTitle());
        teamTaskRepository.deleteById(teamTaskId);

        eventPublisher.publishEvent(event);
    }

    @Override
    @Transactional
    public TeamTask updateTaskMeta(Long teamTaskId, TaskStatus status, TaskPriority priority, TaskType type) {
        TeamTask teamTaskToUpdate = teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));

        boolean isChanged = false;

        if (status != null) {
            if(teamTaskToUpdate.getStatus() != status) {
                teamTaskToUpdate.setStatus(status);
                isChanged = true;
            }
        }
        if (type != null) {
            if(teamTaskToUpdate.getType() != type) {
                teamTaskToUpdate.setType(type);
                isChanged = true;
            }
        }
        if (priority != null) {
            if(teamTaskToUpdate.getPriority() != priority) {
                teamTaskToUpdate.setPriority(priority);
                isChanged = true;
            }
        }

        teamTaskToUpdate = teamTaskRepository.save(teamTaskToUpdate);

        if(isChanged) {
            TeamTaskUpdatedEvent event = new TeamTaskUpdatedEvent(teamTaskToUpdate);
            eventPublisher.publishEvent(event);
        }

        return teamTaskToUpdate;
    }

    @Override
    @Transactional
    public TeamTask updateAssignee(Long teamTaskId, Long assigneeId) {
        if (assigneeId == null) {
            throw new IllegalArgumentException("AssigneeId cannot be null");
        }
        TeamTask teamTaskToUpdate = findById(teamTaskId);
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new EntityNotFoundException("User with id " + assigneeId + " not found"));

        if (teamTaskToUpdate.getTeam().getTeamParticipants()
                .stream().noneMatch(tp -> tp.getUser().getId().equals(assigneeId))) {
            throw new IllegalStateException("Cannot assign task to a user who is not in the team");
        }

        teamTaskToUpdate.setAssignee(assignee);
        teamTaskToUpdate =  teamTaskRepository.save(teamTaskToUpdate);

        TeamTaskUpdatedEvent event = new TeamTaskUpdatedEvent(teamTaskToUpdate);
        eventPublisher.publishEvent(event);

        return teamTaskToUpdate;
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

    @Override
    public TeamTask findById(Long teamTaskId) {
        return teamTaskRepository.findById(teamTaskId).orElseThrow(() -> new EntityNotFoundException("Team task with id " + teamTaskId + " not found"));
    }
}
