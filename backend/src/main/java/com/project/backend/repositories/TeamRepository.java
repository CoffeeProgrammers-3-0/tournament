package com.project.backend.repositories;

import com.project.backend.dto.team.StatisticRowDTO;
import com.project.backend.models.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long>, JpaSpecificationExecutor<Team> {
    @Query("SELECT new com.project.backend.dto.team.StatisticRowDTO(" +
            "t.id, t.name, t.email, js.jury.email, c.text, jsc.points) " +
            "FROM Team t " +
            "JOIN t.submissions s " +
            "JOIN s.jurySubmissions js " +
            "JOIN js.criteriaPoints jsc " +
            "JOIN jsc.criteria c " +
            "WHERE s.round.id = :roundId AND t.id = :teamId")
    List<StatisticRowDTO> getStatisticsByTeamAndRound(@Param("teamId") Long teamId,
                                                      @Param("roundId") Long roundId);
}
