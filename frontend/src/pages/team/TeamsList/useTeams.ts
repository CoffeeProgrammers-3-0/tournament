import {useCallback, useEffect, useState} from "react";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import type {TeamListResponseDto} from "../../../entities/team/team.dto.ts";

const ITEMS_PER_PAGE = 6;

export const useTeams = () => {
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => setPage(1), [debouncedSearch]);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setErrors([]);
        try {
            const params = {
                page: page - 1,
                size: ITEMS_PER_PAGE,
                search: debouncedSearch || undefined
            };

            const response = isAdmin
                ? await teamService.getAllTeams(params)
                : await teamService.getMyTeams(params);

            setTeams(response.content ?? []);
            setTotalPages(response.totalPages ?? 1);
        } catch (e: any) {
            const messages = e.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Помилка завантаження"]);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, isAdmin]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const deleteTeam = useCallback(async (teamId: number) => {
        if (!isAdmin) return false;
        setErrors([]);
        try {
            await teamService.deleteTeam(teamId);
            setTeams((prev) => {
                const updated = prev.filter((t) => t.id !== teamId);
                if (updated.length === 0 && page > 1) setPage((p) => p - 1);
                return updated;
            });
            return true;
        } catch (e: any) {
            const messages = e.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Не вдалося видалити команду"]);
            return false;
        }
    }, [isAdmin, page]);

    return {
        teams, loading, searchQuery, setSearchQuery,
        page, setPage, totalPages, isAdmin, deleteTeam, errors, setErrors
    };
};