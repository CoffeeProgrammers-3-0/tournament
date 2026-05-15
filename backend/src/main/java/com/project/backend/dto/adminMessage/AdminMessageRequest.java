package com.project.backend.dto.adminMessage;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "AdminMessageRequest", description = "DTO for creating or updating an admin message")
public class AdminMessageRequest {
    @Schema(description = "Content of the message", example = "Lorem ipsum")
    private String content;
}
