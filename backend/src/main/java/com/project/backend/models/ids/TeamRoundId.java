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
public class TeamRoundId implements Serializable {
    private Long teamId;
    private Long roundId;
}
