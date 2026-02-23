package com.project.backend.dto.tournament;

import lombok.Data;

@Data
public class TournamentCreateRequest {
    private String name;
    private String description;
    private String startTournament;
    private String startRegistration;
    private String endRegistration;
    private Long maxCountOfTeam;
    private Long countOfRounds;
}
