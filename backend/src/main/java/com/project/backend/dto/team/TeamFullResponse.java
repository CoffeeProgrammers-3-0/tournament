package com.project.backend.dto.team;

import com.project.backend.dto.user.UserResponseForTeam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "TeamFullResponse", description = "DTO representing full details of a team")
public class TeamFullResponse {

    @Schema(description = "ID of the team", example = "1")
    private Long id;

    @Schema(description = "Name of the team", example = "Coffee Programmers")
    private String name;

    @Schema(description = "Email of the team", example = "coffee.programmers@example.com")
    private String email;

    @Schema(description = "Organization of the team", example = "School #1/Sigma Software Group/Star for Life UA")
    private String organization;

    @Schema(description = "Contact information of the team", example = "+380xxxxxxxxx/discord")
    private String contact;

    @Schema(description = "List of users in the team")
    private List<UserResponseForTeam> users;
}