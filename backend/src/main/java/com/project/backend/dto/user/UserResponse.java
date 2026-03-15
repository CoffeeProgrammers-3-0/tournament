package com.project.backend.dto.user;

import com.project.backend.models.constants.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "UserResponse", description = "DTO representing a user")
public class UserResponse {

    @Schema(description = "ID of the user", example = "1")
    private Long id;

    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;

    @Schema(description = "Email of the user", example = "john.doe@test-user.com")
    private String email;

    @Schema(description = "Role of the user", example = "ADMIN")
    private Role role;
}
