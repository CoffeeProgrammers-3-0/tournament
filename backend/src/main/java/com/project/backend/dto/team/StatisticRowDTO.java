package com.project.backend.dto.team;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticRowDTO {
    private Long teamId;
    private String teamName;
    private String teamEmail;
    private String juryEmail;
    private String criteriaText;
    private Long points;
    private boolean isAdditional;
    private String comment;
}
