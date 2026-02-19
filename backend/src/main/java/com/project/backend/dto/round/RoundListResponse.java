package com.project.backend.dto.round;

import lombok.Data;

@Data
public class RoundListResponse {
    private Long id;
    private String name;
    private String startDate;
    private String endDate;
    private String status;
}