package com.project.backend.dto.team;

import com.project.backend.dto.user.UserCreateRequestForTeam;
import lombok.Data;

import java.util.List;

@Data
public class TeamUpdateRequest {
    private String name;
    private String organization;
    private String contact;
    private List<UserCreateRequestForTeam> users;
}