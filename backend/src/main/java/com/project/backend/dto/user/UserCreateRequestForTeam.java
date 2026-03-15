package com.project.backend.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "UserCreateRequestForTeam", description = "DTO for creating a user as part of a team")
public class UserCreateRequestForTeam {

    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;

    @Schema(description = "Email of the user", example = "john.doe@test-user.com")
    private String email;

    @Schema(description = "Indicates if the user is the team leader", example = "true")
    private Boolean isLeader;
}
