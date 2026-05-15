package com.project.backend.repositories;

import com.project.backend.models.adminMessages.AdminMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AdminMessageRepository extends JpaRepository<AdminMessage, Long>, JpaSpecificationExecutor<AdminMessage> {
}
