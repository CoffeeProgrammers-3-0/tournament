package com.project.backend.services.interfaces;

import com.project.backend.models.Notification;
import com.project.backend.models.User;
import org.springframework.data.domain.Page;

public interface NotificationService {

    Page<Notification> findAllByUser(Integer page, Integer size, User user);

    Long countUnseenByUser(User user);
}
