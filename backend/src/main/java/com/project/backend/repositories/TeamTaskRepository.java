package com.project.backend.repositories;

import com.project.backend.models.TeamTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamTaskRepository extends JpaRepository<TeamTask, Long>, JpaSpecificationExecutor<TeamTask> {
}
