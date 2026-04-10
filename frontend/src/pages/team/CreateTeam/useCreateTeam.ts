import {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import {tournamentService} from "../../../services/impl/TournamentService";
import {userService} from "../../../services/impl/UserService.ts";
import type {TeamCreateRequestDto} from "../../../entities/team/team.dto.ts";

export const useCreateTeam = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tournamentId } = useParams<{ tournamentId: string }>();

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);

    const [myTeams, setMyTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<number | string>("");
    const [isExistingTeam, setIsExistingTeam] = useState(false);

    const isLoggedIn = !!Cookies.get("token") || !!Cookies.get("userId");
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

    const initData = useCallback(async () => {
        if (!tournamentId) return;
        setFetchingData(true);
        try {
            const tournament = await tournamentService.getTournamentById(Number(tournamentId));
            const min = 3;
            const max = tournament.maxCountOfTeam || 10;
            setLimits({ min, max });

            if (isLoggedIn) {
                const [profile, teamsRes] = await Promise.all([
                    userService.getMyProfile(),
                    teamService.getMyTeams({ page: 0, size: 50 })
                ]);

                setMyTeams(teamsRes.content || []);

                setFormData(prev => ({
                    ...prev,
                    users: prev.users.map((u, i) => i === 0 ? {
                        fullName: profile.fullName || "",
                        email: profile.email || "",
                        isLeader: true
                    } : u)
                }));
            }
        } catch (err) {
            console.error("Init error:", err);
        } finally {
            setFetchingData(false);
        }
    }, [tournamentId, isLoggedIn]);

    useEffect(() => { initData(); }, [initData]);

    // НОВА ЛОГІКА: Отримуємо повні дані команди по ID
    useEffect(() => {
        const fetchFullTeamData = async () => {
            if (!isExistingTeam || !selectedTeamId) return;

            setLoading(true);
            try {
                const fullTeam = await teamService.getTeamById(Number(selectedTeamId));

                setFormData(prev => {
                    const leader = prev.users[0];
                    const combinedUsers = [leader];

                    // Дозаповнюємо до мінімуму порожніми слотами
                    const finalUsers = Array.from({ length: Math.max(combinedUsers.length, limits.min) }, (_, i) => {
                        return combinedUsers[i] || { fullName: "", email: "", isLeader: false };
                    }).slice(0, limits.max);

                    return {
                        ...prev,
                        name: fullTeam.name || "",
                        email: fullTeam.email || prev.email,
                        organization: fullTeam.organization || "",
                        contact: fullTeam.contact || "",
                        users: finalUsers
                    };
                });
            } catch (err) {
                console.error("Error fetching full team data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFullTeamData();
    }, [selectedTeamId, isExistingTeam, limits.min, limits.max]);

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
        if (formData.users.length <= limits.min || idx === 0) return;
        setFormData(prev => ({
            ...prev,
            users: prev.users.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);
        try {
            await teamService.createTeam(Number(tournamentId), formData);
            setSuccess(true);
            setTimeout(() => navigate(`/tournaments/${tournamentId}`), 1500);
        } catch (err: any) {
            const messages = err.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : [err.response?.data?.message || t("team_create.errors.error")]);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData, loading, fetchingData, errors, success, limits,
        isLoggedIn, myTeams, selectedTeamId, setSelectedTeamId, isExistingTeam, setIsExistingTeam,
        handleTeamChange, handleUserChange, addUser, removeUser, handleSubmit,
        navigate, t
    };
};