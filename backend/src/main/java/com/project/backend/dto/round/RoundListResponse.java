package com.project.backend.dto.round;

import com.project.backend.models.constants.RoundStatus;
import lombok.Data;

@Data
public class RoundListResponse {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private RoundStatus status;
}