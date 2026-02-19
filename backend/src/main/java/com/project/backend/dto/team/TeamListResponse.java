package com.project.backend.dto.team;

import lombok.Data;

@Data
public class TeamListResponse {
    private Long id;
    private String name;
    private String email;
}