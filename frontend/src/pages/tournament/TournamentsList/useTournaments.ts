import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import Cookies from "js-cookie";
import {tournamentService} from "../../../services/impl/TournamentService";
import type {TournamentListResponseDto, TournamentStatus} from "../../../entities/tournament/tournament.dto.ts";

export const TABS = { MAIN: 0, ADMIN: 1 };
const ITEMS_PER_PAGE = 6;

export const useTournaments = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Explicitly boolean check
    const isLoggedIn = !!Cookies.get("userId");
    const userRole = Cookies.get("role");

    const isAdmin = isLoggedIn && userRole === "ADMIN";
    const isJury = isLoggedIn && userRole === "JURY";

    // --- URL SOURCE OF TRUTH ---
    // If not logged in, force MAIN tab
    const tabValue = !isLoggedIn ? TABS.MAIN : (Number(searchParams.get("tab")) || TABS.MAIN);
    const page = Number(searchParams.get("page")) || 1;

    // Logic for default filter:
    // Guest/User -> AVAILABLE, Admin -> ALL, Jury -> ACTIVE
    const getDefaultFilter = () => {
        if (tabValue === TABS.ADMIN) return "ALL";
        if (isJury) return "ACTIVE";
        return "AVAILABLE";
    };

    const filter = searchParams.get("filter") || getDefaultFilter();

    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

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

            // 1. ADMIN VIEW
            if (tabValue === TABS.ADMIN && isAdmin) {
                const reqStatus = filter === "ALL" ? undefined : (filter as TournamentStatus);
                res = await tournamentService.getAllTournaments({ ...baseParams, status: reqStatus });
            }
            // 2. GUEST VIEW (Unauthorized)
            else if (!isLoggedIn) {
                // Guests see "All except DRAFT".
                // We call getAll without a status filter if the backend defaults to public,
                // or we pass a specific flag if your API supports 'excludeStatus'
                res = await tournamentService.getAllTournaments({
                    ...baseParams,
                    // Assuming your backend 'getAll' with no status returns all non-drafts for public
                    // If not, you might need a custom param like: excludeStatus: "DRAFT"
                });
            }
            // 3. LOGGED IN USER/JURY VIEW
            else {
                switch (filter) {
                    case "AVAILABLE":
                        res = await tournamentService.getAvailableTournaments(baseParams);
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
    }, [page, debouncedSearch, tabValue, filter, isLoggedIn, isAdmin]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const handleTabChange = (newValue: number) => {
        if (!isLoggedIn && newValue === TABS.ADMIN) return; // Guard for guests
        const newFilter = newValue === TABS.ADMIN ? "ALL" : "AVAILABLE";
        setSearchParams({ tab: newValue.toString(), page: "1", filter: newFilter });
    };

    const setFilter = (newFilter: string) => {
        // Prevent guests from accessing "My" filters in the URL
        const restrictedFilters = ["REGISTERED", "ACTIVE", "HISTORY"];
        if (!isLoggedIn && restrictedFilters.includes(newFilter)) return;

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