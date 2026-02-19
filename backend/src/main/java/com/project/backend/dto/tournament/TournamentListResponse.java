package com.project.backend.dto.tournament;

import lombok.Data;

@Data
public class TournamentListResponse {
    private Long id;
    private String name;
    private String startDate;
    private String startRegistration;
    private String endRegistration;
    private String status;
}
