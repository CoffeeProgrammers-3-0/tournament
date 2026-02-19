package com.project.backend.dto.round;

import com.project.backend.models.constants.RoundStatus;
import lombok.Data;

@Data
public class RoundUpdateRequest {
    private String name;
    private String startDate;
    private String endDate;
    private Long countOfWinners;
    private String requirements;
    private String task;
    private RoundStatus status;
}