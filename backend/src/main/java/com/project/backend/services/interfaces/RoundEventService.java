package com.project.backend.services.interfaces;

import com.project.backend.models.RoundEvent;
import com.project.backend.models.User;
import org.springframework.data.domain.Page;

public interface RoundEventService {
    Page<RoundEvent> findAll(Integer page, Integer size, Long roundId);

    RoundEvent findById(Long roundEventId);

    RoundEvent create(RoundEvent roundEvent, User user, Long roundId);

    RoundEvent update(Long id, RoundEvent roundEvent);

    void delete(Long id);
}
