package com.project.backend.services.interfaces;

import com.project.backend.models.User;
import com.project.backend.models.adminMessages.AdminMessage;
import com.project.backend.models.adminMessages.GlobalAdminMessage;
import org.springframework.data.domain.Page;

public interface GlobalAdminMessageService {
    Page<GlobalAdminMessage> findAll(Integer page, Integer size);

    GlobalAdminMessage create(AdminMessage adminMessage, User creator);

    GlobalAdminMessage update(Long id, AdminMessage adminMessage);

    void delete(Long id);
}
