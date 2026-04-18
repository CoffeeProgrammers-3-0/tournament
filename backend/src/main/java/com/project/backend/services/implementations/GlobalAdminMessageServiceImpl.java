package com.project.backend.services.implementations;

import com.project.backend.dto.event.GlobalAdminMessageCreatedEvent;
import com.project.backend.models.User;
import com.project.backend.models.adminMessages.AdminMessage;
import com.project.backend.models.adminMessages.GlobalAdminMessage;
import com.project.backend.repositories.GlobalAdminMessageRepository;
import com.project.backend.services.interfaces.GlobalAdminMessageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GlobalAdminMessageServiceImpl implements GlobalAdminMessageService {
    private final GlobalAdminMessageRepository globalAdminMessageRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public Page<GlobalAdminMessage> findAll(Integer page, Integer size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date")));
        return globalAdminMessageRepository.findAll(pageRequest);
    }

    @Override
    @Transactional
    public GlobalAdminMessage create(AdminMessage adminMessage, User creator) {
        GlobalAdminMessage globalAdminMessage = new GlobalAdminMessage();

        globalAdminMessage.setContent(adminMessage.getContent());
        globalAdminMessage.setCreator(creator);
        globalAdminMessage.setDate(Instant.now());
        globalAdminMessage.setSystem(adminMessage.isSystem());

        globalAdminMessage = globalAdminMessageRepository.save(globalAdminMessage);

        GlobalAdminMessageCreatedEvent event = new GlobalAdminMessageCreatedEvent(globalAdminMessage);
        eventPublisher.publishEvent(event);

        return globalAdminMessage;
    }

    @Override
    @Transactional
    public GlobalAdminMessage update(Long id, AdminMessage adminMessage) {
        GlobalAdminMessage globalAdminMessage = globalAdminMessageRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Global admin message with id " + id + " not found"));

        globalAdminMessage.setContent(adminMessage.getContent());

        return globalAdminMessageRepository.save(globalAdminMessage);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        globalAdminMessageRepository.deleteById(id);
    }
}
