package com.project.backend.dto.wrapper;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(name = "PasswordRequest", description = "DTO for changing user password")
public class PasswordRequest {

    @Schema(description = "Old password of the user", example = "OldPass123")
    @NotBlank(message = "Password must be provided")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{6,}$",
            message = "Password must be minimum 6 characters long, containing at least one digit, one uppercase letter, and one lowercase letter"
    )
    private String oldPassword;

    @Schema(description = "New password of the user", example = "NewPass123")
    @NotBlank(message = "Password must be provided")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{6,}$",
            message = "Password must be minimum 6 characters long, containing at least one digit, one uppercase letter, and one lowercase letter"
    )
    private String newPassword;
}
