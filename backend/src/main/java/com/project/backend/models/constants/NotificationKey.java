package com.project.backend.models.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationKey {
    ROUND_CREATED("notifications.round.created");

    private final String i18nKey;
}