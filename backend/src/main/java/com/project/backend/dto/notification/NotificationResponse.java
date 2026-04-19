package com.project.backend.dto.notification;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
@Schema(name = "NotificationResponse", description = "DTO representing a notification sent to a user")
public class NotificationResponse {

    @Schema(description = "ID of the notification", example = "101")
    private Long id;

    @Schema(description = "Key of the notification for localization", example = "notifications.new_round")
    private String key;

    @Schema(description = "JSON string containing additional data for the notification",
            example = "{\"roundId\": 5, \"creator\": \"John Doe\"}")
    private String payload;

    @Schema(description = "Status indicating if the notification has been read by the user", example = "false")
    private boolean seen;

    @Schema(description = "Timestamp when the notification was created", example = "2026-04-10T17:20:00")
    private Instant date;
}