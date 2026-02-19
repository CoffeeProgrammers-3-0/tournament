package com.project.backend.dto.team;

import com.project.backend.dto.user.UserCreateRequestForTeam;
import lombok.Data;

import java.util.List;

@Data
public class TeamCreateRequest {
    private String name;
    private String email;
    private String organization;
    private String contact;
    private List<UserCreateRequestForTeam> users;
}