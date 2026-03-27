import {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {teamService} from "../../../services/impl/TeamService";
import {tournamentService} from "../../../services/impl/TournamentService";
import type {TeamCreateRequestDto} from "../../../entities/team/team.dto.ts";

export const useCreateTeam = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tournamentId } = useParams<{ tournamentId: string }>();

    const [loading, setLoading] = useState(false);
    const [fetchingTournament, setFetchingTournament] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Ліміти учасників
    const [limits, setLimits] = useState({ min: 3, max: 10 });

    const [formData, setFormData] = useState<TeamCreateRequestDto>({
        name: "",
        email: "",
        organization: "",
        contact: "",
        users: Array.from({ length: 3 }, (_, i) => ({
            fullName: "",
            email: "",
            isLeader: i === 0
        }))
    });

    const fetchTournamentInfo = useCallback(async () => {
        if (!tournamentId) return;
        try {
            const tournament = await tournamentService.getTournamentById(Number(tournamentId));
            // Якщо бекенд присилає ліміт учасників на команду, беремо його тут
            setLimits(prev => ({ ...prev, max: tournament.maxCountOfTeam || 10 }));
        } catch (err) {
            console.error("Failed to fetch tournament limits", err);
        } finally {
            setFetchingTournament(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        fetchTournamentInfo();
    }, [fetchTournamentInfo]);

    const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserChange = (idx: number, field: string, value: string) => {
        setFormData(prev => {
            const updatedUsers = [...prev.users];
            updatedUsers[idx] = { ...updatedUsers[idx], [field]: value };
            return { ...prev, users: updatedUsers };
        });
    };

    const addUser = () => {
        if (formData.users.length >= limits.max) return;
        setFormData(prev => ({
            ...prev,
            users: [...prev.users, { fullName: "", email: "", isLeader: false }]
        }));
    };

    const removeUser = (idx: number) => {
        if (formData.users.length <= limits.min) return;
        setFormData(prev => ({
            ...prev,
            users: prev.users.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tournamentId) return setError(t("team_create.errors.choose_tournament"));

        if (formData.users.length < limits.min) {
            return setError(t("team_create.errors.min_members", { count: limits.min }));
        }

        setLoading(true);
        try {
            await teamService.createTeam(Number(tournamentId), formData);
            setSuccess(true);
            setTimeout(() => navigate(`/tournaments/${tournamentId}`), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || t("team_create.errors.error"));
        } finally {
            setLoading(false);
        }
    };

    return {
        formData, loading, fetchingTournament, error, success, limits,
        handleTeamChange, handleUserChange, addUser, removeUser, handleSubmit,
        navigate, t
    };
};