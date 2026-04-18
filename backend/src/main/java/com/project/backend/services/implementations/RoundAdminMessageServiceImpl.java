package com.project.backend.services.implementations;

import com.project.backend.dto.event.RoundAdminMessageCreatedEvent;
import com.project.backend.models.User;
import com.project.backend.models.adminMessages.AdminMessage;
import com.project.backend.models.adminMessages.RoundAdminMessage;
import com.project.backend.repositories.RoundAdminMessageRepository;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.specifications.RoundAdminMessageSpecification;
import com.project.backend.services.interfaces.RoundAdminMessageService;
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
public class RoundAdminMessageServiceImpl implements RoundAdminMessageService {
    private final RoundAdminMessageRepository roundAdminMessageRepository;
    private final RoundRepository roundRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    public Page<RoundAdminMessage> findAll(Integer page, Integer size, Long roundId) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date")));
        return roundAdminMessageRepository.findAll(RoundAdminMessageSpecification.byRoundId(roundId), pageRequest);
    }

    @Override
    public Page<RoundAdminMessage> findAllByUsersRounds(Integer page, Integer size, User user) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date")));
        return roundAdminMessageRepository.findAll(RoundAdminMessageSpecification.byUsersRounds(user.getId()), pageRequest);
    }

    @Override
    @Transactional
    public RoundAdminMessage create(AdminMessage adminMessage, User creator, Long roundId) {
        RoundAdminMessage roundAdminMessage = new RoundAdminMessage();

        roundAdminMessage.setContent(adminMessage.getContent());
        roundAdminMessage.setCreator(creator);
        roundAdminMessage.setDate(Instant.now());
        roundAdminMessage.setRound(roundRepository.getReferenceById(roundId));

        RoundAdminMessageCreatedEvent event = new RoundAdminMessageCreatedEvent(roundAdminMessage);
        eventPublisher.publishEvent(event);

        return roundAdminMessageRepository.save(roundAdminMessage);
    }

    @Override
    @Transactional
    public RoundAdminMessage update(Long id, AdminMessage adminMessage) {
        RoundAdminMessage roundAdminMessage = roundAdminMessageRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Round admin message with id " + id + " not found"));

        roundAdminMessage.setContent(adminMessage.getContent());

        return roundAdminMessageRepository.save(roundAdminMessage);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        roundAdminMessageRepository.deleteById(id);
    }
}
