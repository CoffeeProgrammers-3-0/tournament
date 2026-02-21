package com.project.backend.models;

import com.project.backend.models.constants.Role;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.TeamParticipant;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;


@Entity
@Table(schema = "tournament", name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 37, unique = true, nullable = false)
    @Size(max = 37)
    private String keycloakUserId;

    @Column(unique = true, nullable = false)
    @Size(max = 255)
    private String email;

    @Column(nullable = false)
    @Size(max = 255)
    private String fullName;

    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TeamParticipant> teamParticipants = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Jury> juries = new HashSet<>();

    @OneToMany(mappedBy = "jury", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JurySubmission> jurySubmissions = new HashSet<>();
}
