package com.project.backend.repositories;

import com.project.backend.models.ids.TeamRoundId;
import com.project.backend.models.join_tables.TeamRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamRoundRepository extends JpaRepository<TeamRound, TeamRoundId>, JpaSpecificationExecutor<TeamRound> {
}
