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
import type {TeamTaskResponseDto} from "../../../../entities/teamTask/teamTask.dto.ts";
import {teamService} from "../../../../services/impl/TeamService.ts";
import Cookies from "js-cookie";
import type {PaginationListResponseDto} from "../../../../entities/wrappers/wrapper.dto.ts";
import type {RoundEventListResponseDto} from "../../../../entities/roundEvent/roundEvent.dto.ts";
import {roundEventService} from "../../../../services/impl/RoundEventService.ts";
import type {RoundAdminMessageResponseDto} from "../../../../entities/adminMessage/adminMessage.dto.ts";
import {roundAdminMessageService} from "../../../../services/impl/RoundAdminMessageService.ts";

export const useRoundDetails = (id: string, isUser: boolean) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const [roundData, setRoundData] = useState<RoundFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [jury, setJury] = useState<UserResponseDto[]>([]);

    const [leaderboard, setLeaderboard] = useState<TeamLeaderboardResponseDto[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);

    // Нові стейти для сабмішенів
    const [submissions, setSubmissions] = useState<SubmissionListResponseDto[]>([]);
    const [submissionsPage, setSubmissionsPage] = useState(0);
    const [submissionsTotalPages, setSubmissionsTotalPages] = useState(0);

    const [submissionId, setSubmissionId] = useState<number | null>(null);

    const [tasks, setTasks] = useState<TeamTaskResponseDto[]>([]);
    const [tasksPage, setTasksPage] = useState(0);
    const [tasksTotalPages, setTasksTotalPages] = useState(0);

    const [myTeamUsers, setMyTeamUsers] = useState<UserResponseDto[]>([]);

    const [myTeamId, setMyTeamId] = useState<number>(-1);

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

    const fetchMyTeamId = useCallback(async () => {
        if (!id) return;
        try {
            const data = isUser? (await teamService.getMyTeamIdByRoundId(Number(id))).value : -1;
            setMyTeamId(data);
        } catch (error) {
            console.error("Failed to fetch my team id:", error);
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

    const [maxPoints, setMaxPoints] = useState<number>(0);

    const loadLeaderboard = useCallback(async (isFirstLoad: boolean = false) => {
        if (!id) return;
        fetchMyTeamId();

        const lastTeam = !isFirstLoad && leaderboard.length > 0
            ? leaderboard[leaderboard.length - 1]
            : null;

        if (isFirstLoad) {
            setLoadingTab(true);
            setHasMore(true);
        } else {
            setIsNextPageLoading(true);
        }

        try {
            const pageSize = 10;
            // The response is of type LeaderBoardResponseDto
            const response = await roundService.getLeaderboardForRound(Number(id), {
                last_team_points: lastTeam ? lastTeam.points : 9999,
                last_team_id: lastTeam ? lastTeam.id : 0,
                size: pageSize
            });

            // FIX: Extract the array and the maxPoints separately
            const newTeams = response?.leaderboard || [];
            const mPoints = response?.maxPoints || 0;

            setMaxPoints(mPoints);

            setLeaderboard(prev => {
                // Safety: Ensure prev is always an array
                const safePrev = Array.isArray(prev) ? prev : [];

                if (isFirstLoad) return newTeams;

                const combined = [...safePrev, ...newTeams];
                // Remove duplicates by ID
                return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            });

            setHasMore(newTeams.length === pageSize);

        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            setLeaderboard([]); // Reset on error to prevent UI crash
        } finally {
            setLoadingTab(false);
            setIsNextPageLoading(false);
        }
    }, [id, leaderboard]);

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
        if(Cookies.get("role") === "USER") fetchCheckSubmission(); // Викликаємо перевірку при завантаженні
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

    const [eventsData, setEventsData] = useState<PaginationListResponseDto<RoundEventListResponseDto> | null>(null);
    const [messagesData, setMessagesData] = useState<PaginationListResponseDto<RoundAdminMessageResponseDto> | null>(null);
    const [commsLoading, setCommsLoading] = useState(false);

    const fetchEvents = useCallback(async (page: number = 0, size: number = 10) => {
        if (!id) return;
        try {
            setCommsLoading(true);
            const data = await roundEventService.getEventsByRound(Number(id), page, size);
            setEventsData(data);
        } catch (error) {
            console.error("Failed to fetch round events", error);
        } finally {
            setCommsLoading(false);
        }
    }, [id]);

    const fetchMessages = useCallback(async (page: number = 0, size: number = 10) => {
        if (!id) return;
        try {
            setCommsLoading(true);
            const data = await roundAdminMessageService.getByRound(Number(id), page, size);
            setMessagesData(data);
        } catch (error) {
            console.error("Failed to fetch admin messages", error);
        } finally {
            setCommsLoading(false);
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
        setLeaderboard,
        submissions,
        submissionsPage,
        submissionsTotalPages,
        fetchCategories,
        fetchJury,
        loadLeaderboard,
        fetchSubmissions,
        submissionId,
        fetchCheckSubmission,
        tasks, tasksPage, tasksTotalPages, fetchTasks, fetchAllMyTeammates, myTeamUsers, hasMore,
        isNextPageLoading,
        eventsData,
        messagesData,
        commsLoading,
        fetchEvents,
        fetchMessages,
        myTeamId,
        fetchRound,
        maxPoints
    };
};