import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import Cookies from "js-cookie";
import {tournamentService} from "../../../services/impl/TournamentService";
import type {TournamentListResponseDto, TournamentStatus} from "../../../entities/tournament/tournament.dto.ts";

export const TABS = { AVAILABLE: 0, MY_REGISTED: 1, MY: 2, HISTORY: 3, ADMIN: 4 };
const ITEMS_PER_PAGE = 6;

export const useTournaments = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const isLoggedIn = Cookies.get("userId") !== undefined;
    const userRole = Cookies.get("role");

    const isAdmin = isLoggedIn && userRole === "ADMIN";
    const isJury = isLoggedIn && userRole === "JURY";

    // --- URL SOURCE OF TRUTH ---
    const defaultTab = isJury ? TABS.MY : TABS.AVAILABLE;
    const tabValue = Number(searchParams.get("tab")) || defaultTab;
    const page = Number(searchParams.get("page")) || 1;
    const statusFilter = searchParams.get("status") || "DRAFT"; // Статус в URL

    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false); // Стейт для форми створення

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setSearchParams(prev => {
                prev.set("page", "1");
                return prev;
            }, { replace: true });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, setSearchParams]);

    const fetchTournaments = useCallback(async () => {
        setLoading(true);
        try {
            const apiPage = page - 1;
            const baseParams = { page: apiPage, size: ITEMS_PER_PAGE, search: debouncedSearch || undefined };
            let res;

            switch (tabValue) {
                case TABS.AVAILABLE:
                    res = isLoggedIn
                        ? await tournamentService.getAvailableTournaments(baseParams)
                        : await tournamentService.getAllTournaments({ ...baseParams, status: "REGISTRATION" });
                    break;
                case TABS.MY_REGISTED:
                    res = await tournamentService.getMyTournaments({ ...baseParams, status: "REGISTRATION" });
                    break;
                case TABS.MY:
                    res = await tournamentService.getMyTournaments({ ...baseParams, status: "RUNNING" });
                    break;
                case TABS.HISTORY:
                    res = await tournamentService.getMyTournaments({ ...baseParams, status: "FINISHED" });
                    break;
                case TABS.ADMIN:
                    const reqStatus = statusFilter === "ALL" ? undefined : (statusFilter as TournamentStatus);
                    res = await tournamentService.getAllTournaments({ ...baseParams, status: reqStatus });
                    break;
            }

            if (res) {
                setTournaments(res.content || []);
                setTotalPages(res.totalPages || 1);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, tabValue, statusFilter, isLoggedIn]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const handleTabChange = (newValue: number) => {
        const newParams: any = { tab: newValue.toString(), page: "1" };
        // Зберігаємо фільтр статусу тільки якщо ми на вкладці адміна
        if (newValue === TABS.ADMIN) newParams.status = statusFilter;
        setSearchParams(newParams);
    };

    const setStatusFilter = (newStatus: string) => {
        setSearchParams(prev => {
            prev.set("status", newStatus);
            prev.set("page", "1");
            return prev;
        });
    };

    const setPage = (newPage: number) => {
        setSearchParams(prev => {
            prev.set("page", newPage.toString());
            return prev;
        });
    };

    return {
        tournaments, totalPages, loading, page, setPage,
        tabValue, handleTabChange, searchQuery, setSearchQuery,
        statusFilter, setStatusFilter, isCreating, setIsCreating,
        isAdmin, isJury, isLoggedIn, fetchTournaments
    };
};