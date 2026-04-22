package com.project.backend.mappers;

import com.project.backend.dto.juryCriteria.JuryCriteriaResponse;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CriteriaMapper.class})
public interface JurySubmissionCriteriaMapper {
    @Mapping(target = "jurySubmissionId", source = "jurySubmissionCriteria.jurySubmission.id")
    JuryCriteriaResponse fromJurySubmissionCriteriaToResponse(JurySubmissionCriteria jurySubmissionCriteria);
}
