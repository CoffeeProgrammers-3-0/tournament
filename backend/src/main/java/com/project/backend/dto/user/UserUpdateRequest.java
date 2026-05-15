package com.project.backend.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(name = "UserUpdateRequest", description = "DTO for updating a user's information")
public class UserUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name is too long")
    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;
}
