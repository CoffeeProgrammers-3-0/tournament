package com.project.backend.dto.team;

import com.project.backend.dto.category.CategoryResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Schema(name = "StatisticResponse", description = "DTO representing team statistics with points per jury")
public class StatisticResponse {

    @Schema(description = "ID of the team", example = "1")
    private Long id;

    @Schema(description = "Name of the team", example = "Coffee Programmers")
    private String name;

    @Schema(description = "Email of the team", example = "coffee.programmers@example.com")
    private String email;

    private List<CategoryResponse> categories;

    private List<String> juryEmails;

    @Schema(description = "Points per jury in a nested map structure")
    private Map<String, Map<String, PointResponse>> pointsPerJury;

    @Schema(description = "Points per jury in a nested map structure")
    private Map<String, List<PointResponse>> additionalPointsPerJury;
}