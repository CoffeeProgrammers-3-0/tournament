import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import {roundService} from "../../../../services/impl/RoundService";
import {categoryService} from "../../../../services/impl/CategoryService";
import {userService} from "../../../../services/impl/UserService";
import type {RoundFullResponseDto} from "../../../../entities/round/round.dto";
import type {CategoryResponseDto} from "../../../../entities/category/category.dto";
import type {UserResponseDto} from "../../../../entities/user/user.dto";
import type {TeamLeaderboardResponseDto} from "../../../../entities/team/team.dto";

export const useRoundDetails = (id?: string) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const [roundData, setRoundData] = useState<RoundFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [jury, setJury] = useState<UserResponseDto[]>([]);
    const [leaderboard, setLeaderboard] = useState<TeamLeaderboardResponseDto[]>([]);

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
            const response = await userService.getJuriesByRound({ page: 0, size: 20 }, Number(id));
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
            // Якщо endpoint уже готовий — розкоментуй:
            // const data = await teamService.getLeaderboardByRound(Number(id));
            // setLeaderboard(data.sort((a, b) => b.points - a.points));

            setLeaderboard([]);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
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
    }, [tabValue, categories.length, jury.length, leaderboard.length, fetchCategories, fetchJury, fetchLeaderboard]);

    return {
        navigate,
        loading,
        loadingTab,
        tabValue,
        setTabValue,
        roundData,
        setRoundData,
        categories,
        setCategories,
        jury,
        setJury,
        leaderboard,
        setLeaderboard,
        fetchCategories,
        fetchJury,
        fetchLeaderboard,
    };
};