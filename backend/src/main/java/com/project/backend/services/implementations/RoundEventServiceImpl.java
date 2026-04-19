package com.project.backend.services.implementations;

import com.project.backend.dto.event.RoundEventCreatedEvent;
import com.project.backend.models.RoundEvent;
import com.project.backend.models.User;
import com.project.backend.repositories.RoundEventRepository;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.specifications.RoundEventSpecification;
import com.project.backend.services.interfaces.RoundEventService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoundEventServiceImpl implements RoundEventService {
    private final RoundEventRepository roundEventRepository;
    private final RoundRepository roundRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    public Page<RoundEvent> findAll(Integer page, Integer size, Long roundId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(
                Sort.Order.desc("startDate"),
                Sort.Order.desc("id")
        ));
        return roundEventRepository.findAll(RoundEventSpecification.byRoundId(roundId), pageRequest);
    }

    @Override
    public RoundEvent findById(Long roundEventId) {
        return roundEventRepository.findById(roundEventId).orElseThrow(() -> new EntityNotFoundException("Round event with id " + roundEventId + " not found"));
    }

    @Override
    @Transactional
    public RoundEvent create(RoundEvent roundEvent, User user, Long roundId) {
        if (roundEvent.getStartDate().isAfter(roundEvent.getEndDate())) {
            throw new IllegalStateException("Start date must be before end date");
        }

        roundEvent.setCreator(user);
        roundEvent.setRound(roundRepository.getReferenceById(roundId));
        roundEvent = roundEventRepository.save(roundEvent);

        RoundEventCreatedEvent event = new RoundEventCreatedEvent(roundEvent);
        eventPublisher.publishEvent(event);

        return roundEvent;
    }

    @Override
    @Transactional
    public RoundEvent update(Long id, RoundEvent roundEvent) {
        if (roundEvent.getStartDate().isAfter(roundEvent.getEndDate())) {
            throw new IllegalStateException("Start date must be before end date");
        }

        RoundEvent roundEventToUpdate = findById(id);

        roundEventToUpdate.setDescription(roundEvent.getDescription());
        roundEventToUpdate.setLocation(roundEvent.getLocation());
        roundEventToUpdate.setEndDate(roundEvent.getEndDate());
        roundEventToUpdate.setStartDate(roundEvent.getStartDate());
        roundEventToUpdate.setType(roundEvent.getType());
        roundEventToUpdate.setPlatformUrl(roundEvent.getPlatformUrl());
        roundEventToUpdate.setTitle(roundEvent.getTitle());

        return roundEventRepository.save(roundEventToUpdate);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        roundEventRepository.deleteById(id);
    }
}
