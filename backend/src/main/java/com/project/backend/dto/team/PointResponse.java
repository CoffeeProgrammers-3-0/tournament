package com.project.backend.dto.team;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PointResponse {
    private Long points;
    private String comment;
}
