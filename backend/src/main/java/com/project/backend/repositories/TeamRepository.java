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
           "t.id, t.name, t.email, j.email, c.text, jsc.points, jsc.isAdditional, jsc.comment) " +
           "FROM Criteria c " +
           "JOIN c.category.round r " +
           "CROSS JOIN Team t " +
           "JOIN User j ON j.role = com.project.backend.models.constants.Role.JURY " +
           "LEFT JOIN c.jurySubmissionCriteria jsc ON (" +
           "  jsc.jurySubmission.submission.team.id = t.id AND " +
           "  jsc.jurySubmission.submission.round.id = r.id AND " +
           "  jsc.jurySubmission.jury.id = j.id" +
           ") " +
           "WHERE r.id = :roundId AND t.id = :teamId")
    List<StatisticRowDTO> getStatisticsByTeamAndRound(@Param("teamId") Long teamId,
                                                      @Param("roundId") Long roundId);

    @Query(value = """
                WITH CurrentTournament AS (
                    SELECT tournament_id FROM tournament.rounds WHERE id = :roundId
                ),
                TargetTeams AS (
                    SELECT DISTINCT
                        tr.team_id AS team_id,
                        t.name AS team_name,
                        t.email AS team_email,
                        (
                            SELECT COUNT(*) 
                            FROM tournament.team_participants tp 
                            WHERE tp.team_id = t.id 
                            AND tp.tournament_id = (SELECT tournament_id FROM CurrentTournament)
                        ) AS count_members
                    FROM tournament.team_rounds tr
                    JOIN tournament.teams t ON t.id = tr.team_id
                    WHERE tr.round_id = :roundId
                ),
                ScoredByJury AS (
                    SELECT
                        s.id AS submission_id,
                        s.team_id,
                        js.jury_id,
                        SUM(
                            (
                                COALESCE(jsc.points, 0)::numeric
                                / NULLIF(cnt.count_criteria, 0)
                            ) * cat.weight
                        ) AS jury_score
                    FROM tournament.submissions s
                    JOIN tournament.jury_submission js ON js.submission_id = s.id
                    JOIN tournament.criteria c ON TRUE
                    JOIN tournament.categories cat ON c.category_id = cat.id
                    LEFT JOIN tournament.jury_submission_criteria jsc
                        ON jsc.jury_submission_id = js.id
                        AND jsc.criteria_id = c.id
                        AND jsc.is_additional = false
                    JOIN (
                        SELECT category_id, COUNT(*) AS count_criteria
                        FROM tournament.criteria
                        GROUP BY category_id
                    ) cnt ON cnt.category_id = cat.id
                    WHERE s.round_id = :roundId
                    GROUP BY s.id, s.team_id, js.jury_id
                ),
                AdditionalScores AS (
                    SELECT
                        s.team_id,
                        SUM(COALESCE(jsc.points, 0)) AS additional_points
                    FROM tournament.submissions s
                    JOIN TargetTeams tt ON tt.team_id = s.team_id
                    JOIN tournament.jury_submission js ON js.submission_id = s.id
                    JOIN tournament.jury_submission_criteria jsc
                        ON jsc.jury_submission_id = js.id
                    WHERE s.round_id = :roundId
                      AND jsc.is_additional = true
                    GROUP BY s.team_id
                ),
                ScoredSubmissions AS (
                    SELECT
                        team_id,
                        AVG(jury_score) AS total_points
                    FROM ScoredByJury
                    GROUP BY team_id
                ),
                FinalLeaderboard AS (
                    SELECT
                        tt.team_id,
                        tt.team_name,
                        tt.team_email,
                        tt.count_members AS countOfMembers,
                        COALESCE(ss.total_points, 0) + COALESCE(a.additional_points, 0) AS points
                    FROM TargetTeams tt
                    LEFT JOIN ScoredSubmissions ss ON tt.team_id = ss.team_id
                    LEFT JOIN AdditionalScores a ON tt.team_id = a.team_id
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

    @Query(value = """
            WITH CurrentTournament AS (
                SELECT tournament_id FROM tournament.rounds WHERE id = :roundId
            ),
            TargetTeams AS (
                SELECT DISTINCT
                    tr.team_id AS team_id,
                    t.name AS team_name,
                    t.email AS team_email,
                    (
                        SELECT COUNT(*) 
                        FROM tournament.team_participants tp 
                        WHERE tp.team_id = t.id 
                        AND tp.tournament_id = (SELECT tournament_id FROM CurrentTournament)
                    ) AS count_members
                FROM tournament.team_rounds tr
                JOIN tournament.teams t ON t.id = tr.team_id
                WHERE tr.round_id = :roundId
            ),
            ScoredByJury AS (
                SELECT
                    s.id AS submission_id,
                    s.team_id,
                    js.jury_id,
                    SUM(
                        (
                            COALESCE(jsc.points, 0)::numeric
                            / NULLIF(cnt.count_criteria, 0)
                        ) * cat.weight
                    ) AS jury_score
                FROM tournament.submissions s
                JOIN tournament.jury_submission js ON js.submission_id = s.id
                JOIN tournament.criteria c ON TRUE
                JOIN tournament.categories cat ON c.category_id = cat.id
                LEFT JOIN tournament.jury_submission_criteria jsc
                    ON jsc.jury_submission_id = js.id
                    AND jsc.criteria_id = c.id
                    AND jsc.is_additional = false
                JOIN (
                    SELECT category_id, COUNT(*) AS count_criteria
                    FROM tournament.criteria
                    GROUP BY category_id
                ) cnt ON cnt.category_id = cat.id
                WHERE s.round_id = :roundId
                GROUP BY s.id, s.team_id, js.jury_id
            ),
            AdditionalScores AS (
                SELECT
                    s.team_id,
                    SUM(COALESCE(jsc.points, 0)) AS additional_points
                FROM tournament.submissions s
                JOIN TargetTeams tt ON tt.team_id = s.team_id
                JOIN tournament.jury_submission js ON js.submission_id = s.id
                JOIN tournament.jury_submission_criteria jsc
                    ON jsc.jury_submission_id = js.id
                WHERE s.round_id = :roundId
                  AND jsc.is_additional = true
                GROUP BY s.team_id
            ),
            ScoredSubmissions AS (
                SELECT
                    team_id,
                    AVG(jury_score) AS total_points
                FROM ScoredByJury
                GROUP BY team_id
            )
            SELECT
                tt.team_id,
                tt.team_name,
                tt.team_email,
                tt.count_members AS countOfMembers,
                COALESCE(ss.total_points, 0) + COALESCE(a.additional_points, 0) AS points
            FROM TargetTeams tt
            LEFT JOIN ScoredSubmissions ss ON tt.team_id = ss.team_id
            LEFT JOIN AdditionalScores a ON tt.team_id = a.team_id
            ORDER BY points DESC, tt.team_id DESC
            """, nativeQuery = true)
    List<TeamLeaderboardResponse> findLeaderboard(@Param("roundId") Long roundId);

    @Query(value = """
        WITH CurrentTournament AS (
            SELECT tournament_id FROM tournament.rounds WHERE id = :roundId
        ),
        TargetTeams AS (
            SELECT DISTINCT
                tr.team_id AS team_id,
                t.name AS team_name,
                t.email AS team_email,
                (
                    SELECT COUNT(*) 
                    FROM tournament.team_participants tp 
                    WHERE tp.team_id = t.id 
                    AND tp.tournament_id = (SELECT tournament_id FROM CurrentTournament)
                ) AS count_members
            FROM tournament.team_rounds tr
            JOIN tournament.teams t ON t.id = tr.team_id
            WHERE tr.round_id = :roundId
              AND tr.team_id IN (:teamIds)
        ),
        ScoredByJury AS (
            SELECT
                s.id AS submission_id,
                s.team_id,
                js.jury_id,
                SUM(
                    (
                        COALESCE(jsc.points, 0)::numeric
                        / NULLIF(cnt.count_criteria, 0)
                    ) * cat.weight
                ) AS jury_score
            FROM tournament.submissions s
            JOIN tournament.jury_submission js ON js.submission_id = s.id
            JOIN tournament.criteria c ON TRUE
            JOIN tournament.categories cat ON c.category_id = cat.id
            LEFT JOIN tournament.jury_submission_criteria jsc
                ON jsc.jury_submission_id = js.id
                AND jsc.criteria_id = c.id
                AND jsc.is_additional = false
            JOIN (
                SELECT category_id, COUNT(*) AS count_criteria
                FROM tournament.criteria
                GROUP BY category_id
            ) cnt ON cnt.category_id = cat.id
            WHERE s.round_id = :roundId
            GROUP BY s.id, s.team_id, js.jury_id
        ),
        AdditionalScores AS (
            SELECT
                s.team_id,
                SUM(COALESCE(jsc.points, 0)) AS additional_points
            FROM tournament.submissions s
            JOIN TargetTeams tt ON tt.team_id = s.team_id
            JOIN tournament.jury_submission js ON js.submission_id = s.id
            JOIN tournament.jury_submission_criteria jsc
                ON jsc.jury_submission_id = js.id
            WHERE s.round_id = :roundId
              AND jsc.is_additional = true
            GROUP BY s.team_id
        ),
        ScoredSubmissions AS (
            SELECT
                team_id,
                AVG(jury_score) AS total_points
            FROM ScoredByJury
            GROUP BY team_id
        )
        SELECT
            tt.team_id,
            tt.team_name,
            tt.team_email,
            tt.count_members AS countOfMembers,
            COALESCE(ss.total_points, 0) + COALESCE(a.additional_points, 0) AS points
        FROM TargetTeams tt
        LEFT JOIN ScoredSubmissions ss ON tt.team_id = ss.team_id
        LEFT JOIN AdditionalScores a ON tt.team_id = a.team_id
        """, nativeQuery = true)
    List<TeamLeaderboardResponse> findLeaderboardForTeams(
            @Param("roundId") Long roundId,
            @Param("teamIds") List<Long> teamIds
    );
}