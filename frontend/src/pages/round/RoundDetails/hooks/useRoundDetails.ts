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
            const response = await roundService.getJuriesByRound(Number(id), { page: 0, size: 50 });
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
                last_team_points: 0,
                last_team_id: 0,
                size: 50
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
            const response = await submissionService.getSubmissionsByRound(Number(id), { page, size: 10 });
            setSubmissions(response.content || []);
            setSubmissionsTotalPages(response.totalPages || 0);
            setSubmissionsPage(page);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoadingTab(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRound();
    }, [fetchRound]);

    useEffect(() => {
        if (tabValue === 1 && categories.length === 0) fetchCategories();
        if (tabValue === 2 && jury.length === 0) fetchJury();
        if (tabValue === 3 && leaderboard.length === 0) fetchLeaderboard();
        if (tabValue === 4 && submissions.length === 0) fetchSubmissions();
    }, [tabValue, categories.length, jury.length, leaderboard.length, submissions.length, fetchCategories, fetchJury, fetchLeaderboard, fetchSubmissions]);

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
    };
};