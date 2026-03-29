package com.project.backend.models;

import com.project.backend.models.constants.TaskPriority;
import com.project.backend.models.constants.TaskStatus;
import com.project.backend.models.constants.TaskType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "team_tasks", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class TeamTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    private String title;
    private String description;
    private TaskStatus status = TaskStatus.TODO;
    private TaskType type;
    private TaskPriority priority;
}