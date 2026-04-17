package com.project.backend.dto.event;

import com.project.backend.models.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class NewNotificationsEvent {
    private List<Notification> notifications;
}
