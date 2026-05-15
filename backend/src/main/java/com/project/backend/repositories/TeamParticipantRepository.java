package com.project.backend.repositories;

import com.project.backend.models.ids.TeamParticipantId;
import com.project.backend.models.join_tables.TeamParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface TeamParticipantRepository extends JpaRepository<TeamParticipant, TeamParticipantId>, JpaSpecificationExecutor<TeamParticipant> {
    @Query("SELECT COUNT(tp) > 0 FROM TeamParticipant tp " +
            "WHERE tp.team.id = :teamId AND tp.user.id = :userId AND tp.isLeader = true")
    boolean isUserLeaderOfTeam(Long teamId, Long userId);

    @Query("SELECT COUNT(tp) > 0 FROM TeamParticipant tp " +
            "WHERE tp.team.id = :teamId AND tp.user.id = :userId " +
            "AND tp.tournament.id = :tournamentId AND tp.isLeader = true")
    boolean isUserLeaderOfTeamInTournament(Long teamId, Long userId, Long tournamentId);

    @Query("SELECT COUNT(tp) > 0 FROM TeamParticipant tp " +
            "JOIN TeamTask tt ON tt.team.id = tp.team.id " +
            "WHERE tt.id = :teamTaskId AND tp.user.id = :userId")
    boolean isMemberOfTeamByTaskId(Long teamTaskId, Long userId);
}
