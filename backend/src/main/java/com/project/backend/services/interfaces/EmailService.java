package com.project.backend.services.interfaces;

import org.springframework.scheduling.annotation.Async;

public interface EmailService {
    @Async
    void sendPasswordEmail(String recipient, String password);
}
