package com.project.backend.repositories;

import com.project.backend.models.adminMessages.GlobalAdminMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface GlobalAdminMessageRepository extends JpaRepository<GlobalAdminMessage, Long>, JpaSpecificationExecutor<GlobalAdminMessage> {
}
