import {useCallback, useEffect, useState} from "react";
import {userService} from "../../../services/impl/UserService";
import type {UserResponseDto} from "../../../entities/user/user.dto.ts";

export const useJuryList = () => {
    const [juries, setJuries] = useState<UserResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchJuries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await userService.getJuries({
                query: debouncedQuery || undefined,
                page: page - 1,
                size: 12
            });
            setJuries(response.content);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, page]);

    useEffect(() => { fetchJuries(); }, [fetchJuries]);

    const deleteJury = async (id: number) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цього члена журі?")) return;
        try {
            await userService.deleteUser(id); // Припускаємо наявність методу
            setJuries(prev => prev.filter(j => j.id !== id));
        } catch (error) {
            alert("Помилка при видаленні");
        }
    };

    return { juries, loading, page, setPage, totalPages, searchQuery, setSearchQuery, deleteJury, refresh: fetchJuries };
};