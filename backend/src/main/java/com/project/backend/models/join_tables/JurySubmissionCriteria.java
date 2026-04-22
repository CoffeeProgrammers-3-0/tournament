package com.project.backend.models.join_tables;

import com.project.backend.models.Criteria;
import com.project.backend.models.ids.JurySubmissionCriteriaId;
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

    @EmbeddedId
    private JurySubmissionCriteriaId id;

    @ManyToOne
    @MapsId("jurySubmissionId")
    @JoinColumn(name = "jury_submission_id")
    private JurySubmission jurySubmission;

    @ManyToOne
    @MapsId("criteriaId")
    @JoinColumn(name = "criteria_id")
    private Criteria criteria;

    private Long points;

    private String comment;

    private boolean isAdditional;
}