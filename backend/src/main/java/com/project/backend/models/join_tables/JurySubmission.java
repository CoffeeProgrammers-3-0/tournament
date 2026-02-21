package com.project.backend.models.join_tables;

import com.project.backend.models.Submission;
import com.project.backend.models.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jury_submission", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class JurySubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private Submission submission;

    @ManyToOne
    @JoinColumn(name = "jury_id")
    private User jury;

    @OneToMany(mappedBy = "jurySubmission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JurySubmissionCriteria> criteriaPoints = new HashSet<>();
}