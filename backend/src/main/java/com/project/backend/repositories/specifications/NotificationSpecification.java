package com.project.backend.repositories.specifications;

import com.project.backend.models.Notification;
import com.project.backend.models.User;
import com.project.backend.models.constants.NotificationKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

@Slf4j
public class NotificationSpecification {

    public static Specification<Notification> byReceiverId(Long receiverId) {
        log.debug("NotificationSpecification.byReceiverId called with receiverId={}", receiverId);
        if (receiverId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("receiver").get("id"), receiverId);
    }

    public static Specification<Notification> byReceiver(User receiver) {
        log.debug("NotificationSpecification.byReceiver called with receiver={}", receiver);
        if (receiver == null) return null;
        return (root, query, cb) -> cb.equal(root.get("receiver"), receiver);
    }

    public static Specification<Notification> bySeen(Boolean seen) {
        log.debug("NotificationSpecification.bySeen called with seen={}", seen);
        if (seen == null) return null;
        return (root, query, cb) -> cb.equal(root.get("seen"), seen);
    }

    public static Specification<Notification> byKey(NotificationKey key) {
        log.debug("NotificationSpecification.byKey called with key={}", key);
        if (key == null) return null;
        return (root, query, cb) -> cb.equal(root.get("key"), key);
    }
}