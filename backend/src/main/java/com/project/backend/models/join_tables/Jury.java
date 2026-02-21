package com.project.backend.models.join_tables;

import com.project.backend.models.Round;
import com.project.backend.models.User;
import com.project.backend.models.ids.JuryId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "juries", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class Jury {

    @EmbeddedId
    private JuryId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("roundId")
    @JoinColumn(name = "round_id")
    private Round round;
}