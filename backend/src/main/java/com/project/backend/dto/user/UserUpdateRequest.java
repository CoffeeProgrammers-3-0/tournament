package com.project.backend.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "UserUpdateRequest", description = "DTO for updating a user's information")
public class UserUpdateRequest {

    @Schema(description = "Full name of the user", example = "John Doe")
    private String fullName;
}
