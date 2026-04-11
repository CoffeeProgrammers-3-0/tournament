package com.project.backend.models.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationKey {
    TEST("test");

    private final String i18nKey;
}