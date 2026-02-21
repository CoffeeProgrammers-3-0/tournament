package com.project.backend.models.join_tables;

import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.ids.TeamParticipantId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "team_participants", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class TeamParticipant {

    @EmbeddedId
    private TeamParticipantId id;

    @ManyToOne
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("tournamentId")
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    private Boolean isLeader = false;
}