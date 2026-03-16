package com.project.backend.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "UserCreateRequest", description = "DTO for creating a new user")
public class UserCreateRequest {

    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;

    @Schema(description = "Email of the user", example = "john.doe@test-user.com")
    private String email;
}
