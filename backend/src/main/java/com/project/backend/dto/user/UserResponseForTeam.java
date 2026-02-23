package com.project.backend.dto.user;

import lombok.Data;

@Data
public class UserResponseForTeam {
    private Long id;
    private String fullName;
    private String email;
    private Boolean isLeader;
}
