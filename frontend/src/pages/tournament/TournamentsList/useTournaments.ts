import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import Cookies from "js-cookie";
import {tournamentService} from "../../../services/impl/TournamentService";
import type {TournamentListResponseDto, TournamentStatus} from "../../../entities/tournament/tournament.dto.ts";

export const TABS = { MAIN: 0, ADMIN: 1 };
const ITEMS_PER_PAGE = 6;

export const useTournaments = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const isLoggedIn = Cookies.get("userId") !== undefined;
    const userRole = Cookies.get("role");

    const isAdmin = isLoggedIn && userRole === "ADMIN";
    const isJury = isLoggedIn && userRole === "JURY";

    // --- URL SOURCE OF TRUTH ---
    const tabValue = Number(searchParams.get("tab")) || TABS.MAIN;
    const page = Number(searchParams.get("page")) || 1;

    // Визначаємо фільтр з URL або ставимо дефолтний
    const filter = searchParams.get("filter") || (tabValue === TABS.ADMIN ? "ALL" : (isJury ? "ACTIVE" : "AVAILABLE"));

    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce для пошуку
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            if (searchQuery) {
                setSearchParams(prev => { prev.set("page", "1"); return prev; }, { replace: true });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, setSearchParams]);

    const fetchTournaments = useCallback(async () => {
        setLoading(true);
        try {
            const apiPage = page - 1;
            const baseParams = { page: apiPage, size: ITEMS_PER_PAGE, search: debouncedSearch || undefined };
            let res;

            if (tabValue === TABS.ADMIN) {
                const reqStatus = filter === "ALL" ? undefined : (filter as TournamentStatus);
                res = await tournamentService.getAllTournaments({ ...baseParams, status: reqStatus });
            } else {
                switch (filter) {
                    case "AVAILABLE":
                        res = isLoggedIn
                            ? await tournamentService.getAvailableTournaments(baseParams)
                            : await tournamentService.getAllTournaments({ ...baseParams, status: "REGISTRATION" });
                        break;
                    case "REGISTERED":
                        res = await tournamentService.getMyTournaments({ ...baseParams, status: "REGISTRATION" });
                        break;
                    case "ACTIVE":
                        res = await tournamentService.getMyTournaments({ ...baseParams, status: "RUNNING" });
                        break;
                    case "HISTORY":
                        res = await tournamentService.getMyTournaments({ ...baseParams, status: "FINISHED" });
                        break;
                    default:
                        res = await tournamentService.getAvailableTournaments(baseParams);
                }
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
    }, [page, debouncedSearch, tabValue, filter, isLoggedIn]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const handleTabChange = (newValue: number) => {
        const newFilter = newValue === TABS.ADMIN ? "ALL" : "AVAILABLE";
        setSearchParams({ tab: newValue.toString(), page: "1", filter: newFilter });
    };

    const setFilter = (newFilter: string) => {
        setSearchParams(prev => {
            prev.set("filter", newFilter);
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
        filter, setFilter, isCreating, setIsCreating,
        isAdmin, isJury, isLoggedIn, fetchTournaments
    };
};