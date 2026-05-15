package com.project.backend.models.join_tables;

import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.ids.TeamRoundId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "team_rounds", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class TeamRound {

    @EmbeddedId
    private TeamRoundId id;

    @ManyToOne
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @MapsId("roundId")
    @JoinColumn(name = "round_id")
    private Round round;
}