package com.project.backend.dto.adminMessage;

import com.project.backend.dto.user.UserResponse;
import com.project.backend.models.constants.AdminMessageTargetType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "GlobalAdminMessageResponse", description = "DTO representing a system-wide message created by an administrator")
public class GlobalAdminMessageResponse {

    @Schema(description = "Unique identifier of the admin message", example = "42")
    private Long id;

    @Schema(description = "Information about the administrator who created the message")
    private UserResponse creator;

    @Schema(description = "Timestamp when the message was published", example = "2026-04-10T15:30:00")
    private String date;

    @Schema(description = "Target audience of the message", example = "GENERAL",
            allowableValues = {"GENERAL", "ROUND"})
    private AdminMessageTargetType targetType;

    @Schema(description = "Content of the message", example = "Lorem ipsum")
    private String content;
}
