import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {teamService} from "../../../services/impl/TeamService";
import type {TeamCreateRequestDto} from "../../../entities/team/team.dto.ts";

export const useCreateTeam = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tournamentId } = useParams<{ tournamentId: string }>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<TeamCreateRequestDto>({
        name: "",
        email: "",
        organization: "",
        contact: "",
        users: [
            { fullName: "", email: "", isLeader: true },
            { fullName: "", email: "", isLeader: false }
        ]
    });

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
        setFormData(prev => ({
            ...prev,
            users: [...prev.users, { fullName: "", email: "", isLeader: false }]
        }));
    };

    const removeUser = (idx: number) => {
        if (formData.users.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            users: prev.users.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tournamentId) return setError(t("team_create.errors.choose_tournament"));

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
        formData, loading, error, success,
        handleTeamChange, handleUserChange, addUser, removeUser, handleSubmit,
        navigate, t
    };
};