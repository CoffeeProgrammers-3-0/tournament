package com.project.backend.dto.team;

import lombok.Data;

@Data
public class TeamUpdateRequest {
    private String name;
    private String organization;
    private String contact;
}