package com.project.backend.dto.tournament;

import com.project.backend.models.constants.TournamentStatus;
import lombok.Data;

@Data
public class TournamentListResponse {
    private Long id;
    private String name;
    private String startTournament;
    private String startRegistration;
    private String endRegistration;
    private TournamentStatus status;
}
