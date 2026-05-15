package com.project.backend.services.interfaces;

import com.project.backend.models.User;
import com.project.backend.models.adminMessages.AdminMessage;
import com.project.backend.models.adminMessages.RoundAdminMessage;
import org.springframework.data.domain.Page;

public interface RoundAdminMessageService {
    Page<RoundAdminMessage> findAll(Integer page, Integer size, Long roundId);

    Page<RoundAdminMessage> findAllByUsersRounds(Integer page, Integer size, User user);

    RoundAdminMessage create(AdminMessage adminMessage, User me, Long roundId);

    RoundAdminMessage update(Long id, AdminMessage adminMessage);

    void delete(Long id);
}
