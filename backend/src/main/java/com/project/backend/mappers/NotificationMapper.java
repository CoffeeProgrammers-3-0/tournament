package com.project.backend.mappers;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.backend.dto.notification.NotificationResponse;
import com.project.backend.models.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "key", source = "key.i18nKey")
    @Mapping(target = "payload", source = "payload", qualifiedByName = "jsonNodeToString")
    NotificationResponse fromNotificationToResponse(Notification notification);

    @Named("jsonNodeToString")
    default String jsonNodeToString(JsonNode payload) {
        if (payload == null || payload.isNull()) {
            return null;
        }
        return payload.toString();
    }
}