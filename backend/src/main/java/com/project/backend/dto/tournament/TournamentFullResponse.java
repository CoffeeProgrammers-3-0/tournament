package com.project.backend.dto.tournament;

import com.project.backend.models.constants.TournamentStatus;
import lombok.Data;

@Data
public class TournamentFullResponse {
    private Long id;
    private String name;
    private String description;
    private String startTournament;
    private String startRegistration;
    private String endRegistration;
    private Long maxCountOfTeam;
    private Long countOfRounds;
    private TournamentStatus status;
}
