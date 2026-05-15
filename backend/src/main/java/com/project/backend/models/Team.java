package com.project.backend.models;

import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.models.join_tables.TeamRound;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "teams", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;
    private String organization;
    private String contact;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TeamParticipant> teamParticipants = new HashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TeamRound> teamRounds = new HashSet<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Submission> submissions = new HashSet<>();
}