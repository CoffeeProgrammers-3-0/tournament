package com.project.backend.mappers;

import com.project.backend.dto.adminMessage.AdminMessageRequest;
import com.project.backend.dto.adminMessage.GlobalAdminMessageResponse;
import com.project.backend.dto.adminMessage.RoundAdminMessageResponse;
import com.project.backend.models.adminMessages.AdminMessage;
import com.project.backend.models.adminMessages.GlobalAdminMessage;
import com.project.backend.models.adminMessages.RoundAdminMessage;
import org.mapstruct.Mapper;


@Mapper(
    componentModel = "spring", 
    uses = {UserMapper.class, RoundMapper.class}
)
public interface AdminMessageMapper {
    AdminMessage fromRequestToAdminMessage(AdminMessageRequest adminMessageRequest);
    GlobalAdminMessageResponse fromGlobalAdminMessageToGlobalResponse(GlobalAdminMessage globalAdminMessage);
    RoundAdminMessageResponse fromRoundAdminMessageToRoundResponse(RoundAdminMessage roundAdminMessage);
}