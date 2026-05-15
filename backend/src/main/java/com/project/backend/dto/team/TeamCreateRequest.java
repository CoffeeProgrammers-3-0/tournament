package com.project.backend.dto.team;

import com.project.backend.dto.user.UserCreateRequestForTeam;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "TeamCreateRequest", description = "DTO for creating a new team")
public class TeamCreateRequest {


    @NotBlank(message = "Team name is required")
    @Size(max = 255, message = "Team name is too long")
    @Schema(description = "Name of the team", example = "Coffee Programmers")
    private String name;

    @NotBlank(message = "Team email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Email of the team", example = "coffee.programmers@example.com")
    private String email;

    @Schema(description = "Organization of the team", example = "School #1/Sigma Software Group/Star for Life UA")
    private String organization;

    @Schema(description = "Contact information of the team", example = "+380xxxxxxxxx/discord")
    private String contact;

    @Valid
    @NotEmpty(message = "The team must have at least one user")
    @Schema(description = "List of users in the team")
    private List<UserCreateRequestForTeam> users;
}