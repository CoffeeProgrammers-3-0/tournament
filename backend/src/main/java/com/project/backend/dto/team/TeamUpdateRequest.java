package com.project.backend.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "TeamUpdateRequest", description = "DTO for updating an existing team")
public class TeamUpdateRequest {

    @Schema(description = "Name of the team", example = "Coffee Programmers")
    private String name;

    @Schema(description = "Organization of the team", example = "School #1/Sigma Software Group/Star for Life UA")
    private String organization;

    @Schema(description = "Contact information of the team", example = "+380xxxxxxxxx/discord")
    private String contact;
}