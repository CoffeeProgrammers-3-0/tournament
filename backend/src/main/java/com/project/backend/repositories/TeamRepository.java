package com.project.backend.repositories;

import com.project.backend.dto.team.StatisticRowDTO;
import com.project.backend.dto.team.TeamLeaderboardResponse;
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

    @Query(value = """
                WITH TargetTeams AS (
                    SELECT DISTINCT
                        t.id AS team_id,
                        t.name AS team_name,
                        t.email AS team_email
                    FROM tournament.teams t
                    JOIN tournament.team_participants tp ON tp.team_id = t.id
                    JOIN tournament.tournaments trn ON tp.tournament_id = trn.id
                    JOIN tournament.rounds r ON r.tournament_id = trn.id
                    WHERE r.id = :roundId
                ),
                ScoredSubmissions AS (
                    SELECT
                        s.team_id,
                        COALESCE(
                            SUM(
                                COALESCE(
                                    (jsc.points::numeric / NULLIF(sub.count_criteria, 0)) * cat.weight,\s
                                    0
                                )
                            ) / NULLIF(COUNT(DISTINCT js.jury_id), 0),
                            0
                        ) AS total_points
                    FROM tournament.submissions s
                    JOIN tournament.jury_submission js ON js.submission_id = s.id
                    JOIN tournament.jury_submission_criteria jsc ON jsc.jury_submission_id = js.id
                    JOIN tournament.criteria c ON jsc.criteria_id = c.id
                    JOIN tournament.categories cat ON c.category_id = cat.id
                    LEFT JOIN (
                        SELECT category_id, COUNT(*) AS count_criteria
                        FROM tournament.criteria
                        GROUP BY category_id
                    ) AS sub ON sub.category_id = cat.id
                    WHERE s.round_id = :roundId
                    GROUP BY s.team_id
                ),
                FinalLeaderboard AS (
                    SELECT
                        tt.team_id,
                        tt.team_name,
                        tt.team_email,
                        COALESCE(ss.total_points, 0) AS points
                    FROM TargetTeams tt
                    LEFT JOIN ScoredSubmissions ss ON tt.team_id = ss.team_id
                )
                SELECT * FROM FinalLeaderboard
                WHERE (:lastPoints IS NULL
                       OR points < :lastPoints
                       OR (points = :lastPoints AND team_id < :lastId))
                       AND (:lastId IS NULL OR team_id <> :lastId)
                ORDER BY points DESC, team_id DESC
                LIMIT :size;
            """, nativeQuery = true)
    List<TeamLeaderboardResponse> findLeaderboard(
            @Param("roundId") Long roundId,
            @Param("lastPoints") Double lastPoints,
            @Param("lastId") Long lastId,
            @Param("size") Integer size
    );
}
