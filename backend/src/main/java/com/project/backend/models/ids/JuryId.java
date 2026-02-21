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
public class JuryId implements Serializable {
    private Long userId;
    private Long tournamentId;
}
