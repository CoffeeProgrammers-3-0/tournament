package com.project.backend.models.join_tables;

import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.ids.JuryId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jury", schema = "tournament")
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
    @MapsId("tournamentId")
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @OneToMany(mappedBy = "jury", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JurySubmission> jurySubmissions = new HashSet<>();
}