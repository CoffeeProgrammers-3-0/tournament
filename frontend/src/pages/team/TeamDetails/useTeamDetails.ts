import {useCallback, useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import {tournamentService} from "../../../services/impl/TournamentService.ts";
import type {TeamFullResponseDto} from "../../../entities/team/team.dto.ts";
import type {UserCreateRequestForTeamDto} from "../../../entities/user/user.dto.ts";

export const useTeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const currentUserId = Number(Cookies.get("userId") || 0);
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto | null>(null);
    const [tournamentDates, setTournamentDates] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const fetchTeam = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const team = await teamService.getTeamById(Number(id));
            setTeamData(team);

            // Fetch start dates for all unique tournaments this team is in
            const uniqueTIds = Array.from(new Set(team.users.map(u => u.tournamentId)));
            const dateMap: Record<number, string> = {};

            await Promise.all(uniqueTIds.map(async (tId) => {
                const t = await tournamentService.getTournamentById(tId);
                dateMap[tId] = t.startTournament;
            }));

            setTournamentDates(dateMap);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchTeam(); }, [fetchTeam]);

    const membersByTournament = useMemo(() => {
        if (!teamData?.users) return {};
        return teamData.users.reduce((acc: any, user) => {
            const tId = user.tournamentId;
            if (!acc[tId]) {
                acc[tId] = {
                    name: user.tournamentName,
                    startDate: tournamentDates[tId],
                    members: []
                };
            }
            acc[tId].members.push(user);
            return acc;
        }, {});
    }, [teamData, tournamentDates]);

    const canManageTournament = useCallback((tournamentId: number) => {
        if (isAdmin) return { can: true, reason: "ADMIN_POWER" };

        const tournamentGroup = membersByTournament[tournamentId];
        if (!tournamentGroup) return { can: false, reason: "NOT_FOUND" };

        const userInThisTournament = teamData?.users?.find(u =>
            u.id === currentUserId && u.tournamentId === tournamentId
        );

        if (!userInThisTournament?.isLeader) return { can: false, reason: "NOT_LEADER" };

        // Date check
        const hasStarted = tournamentGroup.startDate && new Date() > new Date(tournamentGroup.startDate);
        if (hasStarted) return { can: false, reason: "TOURNAMENT_STARTED" };

        return { can: true, reason: "LEADER_BEFORE_START" };
    }, [teamData, currentUserId, isAdmin, membersByTournament]);

    const [errors, setErrors] = useState<string[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const clearErrors = () => setErrors([]);

    const handleAddMember = async (member: UserCreateRequestForTeamDto, tournamentId: number) => {
        if (!teamData || !tournamentId) return;
        clearErrors();
        setIsActionLoading(true);
        try {
            const updated = await teamService.addMember(teamData.id, tournamentId, member);
            setTeamData(updated);
            return true; // для закриття модалки в компоненті
        } catch (err: any) {
            const messages = err.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Не вдалося додати учасника"]);
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteMember = async (userId: number, tournamentId: number) => {
        if (!teamData) return;
        clearErrors();
        try {
            const updated = await teamService.removeMember(teamData.id, userId, tournamentId);
            setTeamData(updated);
        } catch (err: any) {
            // Оскільки видалення зазвичай у простому діалозі,
            // можемо вивести помилку через window.alert або окремий стейт
            alert(err.response?.data?.messages?.[0] || "Помилка видалення");
        }
    };

    const handlePromote = async (userId: number, tournamentId: number) => {
        if (!teamData) return;
        clearErrors();
        try {
            const updated = await teamService.setTeamLeader(teamData.id, userId, tournamentId);
            setTeamData(updated);
        } catch (err: any) {
            alert(err.response?.data?.messages?.[0] || "Помилка призначення лідера");
        }
    };

    return {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember, handleDeleteMember, handlePromote,
        errors, clearErrors, isActionLoading,
    };
};