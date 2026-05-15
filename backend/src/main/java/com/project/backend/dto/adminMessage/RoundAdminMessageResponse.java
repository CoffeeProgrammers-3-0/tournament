package com.project.backend.dto.adminMessage;

import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.models.constants.AdminMessageTargetType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "RoundAdminMessageResponse", description = "DTO representing a round message created by an administrator")
public class RoundAdminMessageResponse {

    @Schema(description = "Unique identifier of the admin message", example = "42")
    private Long id;

    @Schema(description = "Information about the administrator who created the message")
    private UserResponse creator;

    @Schema(description = "Timestamp when the message was published", example = "2026-04-10T15:30:00.000Z")
    private Instant date;

    @Schema(description = "Target audience of the message", example = "ROUND",
            allowableValues = {"ROUND"})
    private AdminMessageTargetType targetType;

    @Schema(description = "Content of the message", example = "Lorem ipsum")
    private String content;

    @Schema(description = "Round of the message")
    private RoundListResponse round;
}