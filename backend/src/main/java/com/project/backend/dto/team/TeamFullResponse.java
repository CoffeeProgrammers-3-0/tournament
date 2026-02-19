package com.project.backend.dto.team;

import com.project.backend.dto.user.UserResponseForTeam;
import lombok.Data;

import java.util.List;

@Data
public class TeamFullResponse {
    private Long id;
    private String name;
    private String email;
    private String organization;
    private String contact;
    private List<UserResponseForTeam> users;
}