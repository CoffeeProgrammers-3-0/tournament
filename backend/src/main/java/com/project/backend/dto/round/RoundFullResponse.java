package com.project.backend.dto.round;

import lombok.Data;

@Data
public class RoundFullResponse {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private Long countOfWinners;
    private String requirements;
    private String task;
    private String status;
}