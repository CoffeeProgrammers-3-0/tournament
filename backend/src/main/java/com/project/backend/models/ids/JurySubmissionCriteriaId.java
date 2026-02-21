package com.project.backend.models.ids;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class JurySubmissionCriteriaId implements Serializable {
    private Long jurySubmissionId;
    private Long criteriaId;
}