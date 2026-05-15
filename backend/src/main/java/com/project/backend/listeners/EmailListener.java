package com.project.backend.listeners;

import com.project.backend.dto.event.SendPasswordEvent;
import com.project.backend.services.interfaces.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailListener {
    private final EmailService emailService;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleSendPasswordEvent(SendPasswordEvent event) {
        emailService.sendPasswordEmail(event.getEmail(), event.getPassword());
    }
}
