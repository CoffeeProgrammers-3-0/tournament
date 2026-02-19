package com.project.backend.dto.juryCriteria;

import com.project.backend.dto.criteria.CriteriaResponse;
import lombok.Data;

@Data
public class JuryCriteriaResponse {
    private Long id;
    private CriteriaResponse criteria;
    private Long points;
}
