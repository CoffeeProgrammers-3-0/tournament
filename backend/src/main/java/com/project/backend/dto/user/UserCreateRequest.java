package com.project.backend.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(name = "UserCreateRequest", description = "DTO for creating a new user")
public class UserCreateRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name is too long")
    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;

    @NotBlank(message = "Team email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Email of the user", example = "john.doe@test-user.com")
    private String email;
}
