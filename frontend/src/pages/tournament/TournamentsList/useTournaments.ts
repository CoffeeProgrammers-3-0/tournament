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

    // Визначаємо поточну вкладку з URL або дефолтну
    const defaultTab = isJury ? TABS.MY : TABS.AVAILABLE;
    const queryTab = searchParams.get("tab");
    const urlTabValue = queryTab !== null ? parseInt(queryTab, 10) : defaultTab;

    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [tabValue, setTabValue] = useState(urlTabValue);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("DRAFT");
    const [page, setPage] = useState(1);

    // Синхронізуємо стейт вкладки, якщо URL змінився (наприклад, кнопками браузера)
    useEffect(() => {
        if (urlTabValue !== tabValue) {
            setTabValue(urlTabValue);
            setPage(1); // Скидаємо сторінку при зміні вкладки
        }
    }, [urlTabValue, tabValue]);

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

    // Виконуємо запит при будь-якій зміні залежностей fetchTournaments
    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleTabChange = (newValue: number) => {
        setTabValue(newValue);
        setSearchParams({ tab: newValue.toString() }); // Оновлюємо URL
        setPage(1);
    };

    return {
        tournaments, totalPages, loading, page, setPage,
        tabValue, handleTabChange, searchQuery, setSearchQuery,
        statusFilter, setStatusFilter, isCreating, setIsCreating,
        isAdmin, isJury, isLoggedIn, fetchTournaments
    };
};