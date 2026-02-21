package com.project.backend.models;

import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.TeamParticipant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tournaments", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    private TournamentStatus status;

    private LocalDateTime startTournament;

    private LocalDateTime startRegistration;

    private LocalDateTime endRegistration;

    private Long maxCountOfTeam;

    private Long countOfRounds;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Round> rounds = new HashSet<>();

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TeamParticipant> teamParticipants = new HashSet<>();

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Jury> juries = new HashSet<>();
}