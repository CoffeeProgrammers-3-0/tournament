package com.project.backend.models.join_tables;

import com.project.backend.models.Criteria;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "jury_submission_criteria", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class JurySubmissionCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "jury_submission_id", nullable = false)
    private JurySubmission jurySubmission;

    @ManyToOne
    @JoinColumn(name = "criteria_id")
    private Criteria criteria;

    private Long points;

    private String comment;

    private boolean isAdditional;
}