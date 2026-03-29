import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import {roundService} from "../../../../services/impl/RoundService";
import {categoryService} from "../../../../services/impl/CategoryService";
import {submissionService} from "../../../../services/impl/SubmissionService";
import type {RoundFullResponseDto} from "../../../../entities/round/round.dto";
import type {CategoryResponseDto} from "../../../../entities/category/category.dto";
import type {UserResponseDto} from "../../../../entities/user/user.dto";
import type {TeamLeaderboardResponseDto} from "../../../../entities/team/team.dto";
import type {SubmissionListResponseDto} from "../../../../entities/submission/submission.dto";
import {teamTaskService} from "../../../../services/impl/TeamTaskService.ts";
import type {TeamTaskResponseDto} from "../../../../entities/teamTask/teamtask.dto.ts";
import {teamService} from "../../../../services/impl/TeamService.ts";

export const useRoundDetails = (id?: string) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const [roundData, setRoundData] = useState<RoundFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [jury, setJury] = useState<UserResponseDto[]>([]);
    const [leaderboard, setLeaderboard] = useState<TeamLeaderboardResponseDto[]>([]);

    // Нові стейти для сабмішенів
    const [submissions, setSubmissions] = useState<SubmissionListResponseDto[]>([]);
    const [submissionsPage, setSubmissionsPage] = useState(0);
    const [submissionsTotalPages, setSubmissionsTotalPages] = useState(0);

    const [submissionId, setSubmissionId] = useState<number | null>(null);

    const [tasks, setTasks] = useState<TeamTaskResponseDto[]>([]);
    const [tasksPage, setTasksPage] = useState(0);
    const [tasksTotalPages, setTasksTotalPages] = useState(0);

    const [myTeamUsers, setMyTeamUsers] = useState<UserResponseDto[]>([]);

    const fetchCheckSubmission = useCallback(async () => {
        if (!id) return;
        try {
            const sid = await submissionService.checkSubmission(Number(id));
            // Перетворюємо результат у число (про всяк випадок)
            setSubmissionId(Number(sid));
        } catch (error) {
            console.error("Failed to check submission:", error);
        }
    }, [id]);

    const fetchRound = useCallback(async () => {
        if (!id) return;
        try {
            const data = await roundService.getRoundById(Number(id));
            setRoundData(data);
        } catch (error) {
            console.error("Failed to fetch round:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchCategories = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const data = await categoryService.getCategories(Number(id));
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoadingTab(false);
        }
    }, [id]);

    const fetchJury = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const response = await roundService.getJuriesByRound(Number(id), {page: 0, size: 50});
            setJury(response.content || []);
        } catch (error) {
            console.error("Error fetching jury for round:", error);
            setJury([]);
        } finally {
            setLoadingTab(false);
        }
    }, [id]);

    const fetchLeaderboard = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const data = await roundService.getLeaderboardForRound(Number(id), {
                last_team_points: 100,
                last_team_id: 0,
                size: 10
            });
            setLeaderboard(data.sort((a, b) => b.points - a.points));
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoadingTab(false);
        }
    }, [id]);

    const fetchSubmissions = useCallback(async (page = 0) => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const response = await submissionService.getSubmissionsByRound(Number(id), {page, size: 10});
            setSubmissions(response.content || []);
            setSubmissionsTotalPages(response.totalPages || 0);
            setSubmissionsPage(page);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoadingTab(false);
        }
    }, [id]);

    const fetchAllMyTeammates = useCallback(async () => {
        try {
            setMyTeamUsers(await teamService.getAllUsersByRoundOfMyTeam(Number(id)));
        } catch (error: any) {}
    }, [id]);

    useEffect(() => {
        fetchRound();
        fetchCheckSubmission(); // Викликаємо перевірку при завантаженні
    }, [fetchRound, fetchCheckSubmission]);

    const fetchTasks = useCallback(async (page = 0, showLoader = true) => {
        if (!id) return;
        if (showLoader) setLoadingTab(true); // Показуємо лоадер ТІЛЬКИ якщо це не фонове оновлення
        try {
            const response = await teamTaskService.getTasksForMyTeamAndRound(Number(id), { page, size: 10 });
            setTasks(response.content || []);
            setTasksTotalPages(response.totalPages || 0);
            setTasksPage(page);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            if (showLoader) setLoadingTab(false);
        }
    }, [id]);

    return {
        navigate,
        loading,
        loadingTab,
        tabValue,
        setTabValue,
        roundData,
        setRoundData,
        categories,
        jury,
        leaderboard,
        submissions,
        submissionsPage,
        submissionsTotalPages,
        fetchCategories,
        fetchJury,
        fetchLeaderboard,
        fetchSubmissions,
        submissionId,
        fetchCheckSubmission,
        tasks, tasksPage, tasksTotalPages, fetchTasks, fetchAllMyTeammates, myTeamUsers
    };
};