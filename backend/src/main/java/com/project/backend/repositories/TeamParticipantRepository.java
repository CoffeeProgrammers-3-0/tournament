package com.project.backend.repositories;

import com.project.backend.models.ids.TeamParticipantId;
import com.project.backend.models.join_tables.TeamParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TeamParticipantRepository extends JpaRepository<TeamParticipant, TeamParticipantId>, JpaSpecificationExecutor<TeamParticipant> {
}
