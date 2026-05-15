package com.project.backend.mappers;

import com.project.backend.dto.criteria.CriteriaResponse;
import com.project.backend.models.Criteria;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CriteriaMapper {
    CriteriaResponse fromCriteriaToResponse(Criteria criteria);
}
