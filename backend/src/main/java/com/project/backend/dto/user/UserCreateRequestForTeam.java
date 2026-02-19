package com.project.backend.dto.user;

import lombok.Data;

@Data
public class UserCreateRequestForTeam {
    private String fullName;
    private String email;
    private boolean isLeader;
}
