package com.project.backend.models;

import com.project.backend.models.join_tables.JurySubmission;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "submissions", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @JoinColumn(name = "round_id")
    private Round round;

    @Column(columnDefinition = "text")
    private String githubLink;

    @Column(columnDefinition = "text")
    private String videoLink;

    @Column(columnDefinition = "text")
    private String description;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JurySubmission> jurySubmissions = new HashSet<>();
}