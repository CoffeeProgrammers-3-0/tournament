package com.project.backend.mappers;

import com.project.backend.dto.roundEvent.RoundEventFullResponse;
import com.project.backend.dto.roundEvent.RoundEventListResponse;
import com.project.backend.dto.roundEvent.RoundEventRequest;
import com.project.backend.models.RoundEvent;
import org.mapstruct.Mapper;

@Mapper(
    componentModel = "spring", 
    uses = {UserMapper.class}
)
public interface RoundEventMapper {
    RoundEventFullResponse fromRoundEventToFullResponse(RoundEvent roundEvent);
    RoundEventListResponse fromRoundEventToListResponse(RoundEvent roundEvent);
    RoundEvent fromRequestToRoundEvent(RoundEventRequest roundEventRequest);
}