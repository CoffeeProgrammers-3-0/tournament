package com.project.backend.dto.team;

import lombok.Data;

import java.util.Map;

@Data
public class StatisticResponse {
    private Long id;
    private String name;
    private String email;
    private Map<String, Map<String, Integer>> pointsPerJury;
}