package com.project.backend.mappers;

import com.project.backend.dto.round.RoundCreateRequest;
import com.project.backend.dto.round.RoundFullResponse;
import com.project.backend.dto.round.RoundListResponse;
import com.project.backend.dto.round.RoundUpdateRequest;
import com.project.backend.models.Round;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoundMapper {
    Round fromCreateRequestToRound(RoundCreateRequest roundCreateRequest);
    Round fromUpdateRequestToRound(RoundUpdateRequest roundUpdateRequest);

    RoundListResponse fromRoundToListResponse(Round round);
    RoundFullResponse fromRoundToFullResponse(Round round);
}
