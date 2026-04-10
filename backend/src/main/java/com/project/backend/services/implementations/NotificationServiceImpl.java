package com.project.backend.services.implementations;

import com.project.backend.models.Notification;
import com.project.backend.models.User;
import com.project.backend.repositories.NotificationRepository;
import com.project.backend.repositories.specifications.NotificationSpecification;
import com.project.backend.services.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;

    @Override
    public Page<Notification> findAllByUser(Integer page, Integer size, User user) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(
                Sort.Order.desc("date"),
                Sort.Order.desc("id")
        ));
        Page<Notification> notifications = notificationRepository.findAll(NotificationSpecification.byReceiverId(user.getId()), pageRequest);

        if (!notifications.isEmpty()) {
            List<Long> ids = notifications.getContent().stream()
                    .map(Notification::getId)
                    .toList();

            notificationRepository.markAsSeenByIds(ids);
        }

        return notifications;
    }

    @Override
    public Long countUnseenByUser(User user) {
        return notificationRepository.count(
                Specification.allOf(
                        NotificationSpecification.byReceiverId(user.getId()),
                        NotificationSpecification.bySeen(false)
                )
        );
    }
}
