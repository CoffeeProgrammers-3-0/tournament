package com.project.backend.dto.round;

import lombok.Data;

@Data
public class RoundCreateRequest {
    private String name;
    private String startDate;
    private String endDate;
    private Long countOfWinners;
    private String requirements;
    private String task;
}