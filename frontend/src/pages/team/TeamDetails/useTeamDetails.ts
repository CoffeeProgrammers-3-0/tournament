import {useCallback, useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import type {TeamFullResponseDto, TeamUpdateRequestDto} from "../../../entities/team/team.dto";
import type {UserCreateRequestForTeamDto} from "../../../entities/user/user.dto";

export const useTeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const currentUserId = Number(Cookies.get("userId") || 0);
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    // Editing & Error State
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [headerForm, setHeaderForm] = useState<TeamUpdateRequestDto>({ name: "", organization: "", contact: "" });
    const [errors, setErrors] = useState<string[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Helper to safely extract error messages from Axios responses
    const extractErrors = (err: any): string[] => {
        const messages = err?.response?.data?.messages || err?.response?.data?.message;
        if (Array.isArray(messages)) return messages;
        if (typeof messages === "string") return [messages];
        return [err.message || "An unexpected error occurred. Please try again."];
    };

    const fetchTeam = useCallback(async () => {
        if (!id || isNaN(Number(id)) || Number(id) < 1) {
            window.location.replace('/404');
            return;
        }

        setLoading(true);
        setErrors([]);
        try {
            const team = await teamService.getTeamById(Number(id));
            setTeamData(team);
            setHeaderForm({
                name: team.name,
                organization: team.organization || "",
                contact: team.contact
            });
        } catch (err) {
            console.error("Fetch error:", err);
            setErrors(extractErrors(err));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchTeam(); }, [fetchTeam]);

    const handleUpdateTeam = async () => {
        if (!teamData) return;
        setIsActionLoading(true);
        setErrors([]);
        try {
            const updated = await teamService.updateTeam(teamData.id, headerForm);
            setTeamData(updated);
            setIsEditingHeader(false);
            return true;
        } catch (err) {
            setErrors(extractErrors(err));
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAddMember = async (member: UserCreateRequestForTeamDto, tournamentId: number) => {
        if (!teamData) return;
        setErrors([]);
        setIsActionLoading(true);
        try {
            const updated = await teamService.addMember(teamData.id, tournamentId, member);
            setTeamData(updated);
            return true;
        } catch (err) {
            setErrors(extractErrors(err));
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteMember = async (uId: number, tId: number) => {
        if (!teamData) return;
        setErrors([]);
        setIsActionLoading(true);
        try {
            const updated = await teamService.removeMember(teamData.id, uId, tId);
            setTeamData(updated);
            return true;
        } catch (err) {
            setErrors(extractErrors(err));
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePromote = async (uId: number, tId: number) => {
        if (!teamData) return;
        setErrors([]);
        setIsActionLoading(true);
        try {
            const updated = await teamService.setTeamLeader(teamData.id, uId, tId);
            setTeamData(updated);
            return true;
        } catch (err) {
            setErrors(extractErrors(err));
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const membersByTournament = useMemo(() => {
        if (!teamData?.users) return {};
        return teamData.users.reduce((acc: any, user: any) => {
            const tId = user.tournamentId;
            if (!acc[tId]) {
                acc[tId] = {
                    name: user.tournamentName,
                    status: user.tournamentStatus,
                    maxMembers: user.tournamentMaxCountOfTeam,
                    members: []
                };
            }
            acc[tId].members.push(user);
            return acc;
        }, {});
    }, [teamData]);

    const canManageTournament = useCallback((tournamentId: number) => {
        if (isAdmin) return { can: true, reason: "ADMIN_POWER" };
        const tournamentGroup = membersByTournament[tournamentId];
        if (!tournamentGroup) return { can: false, reason: "NOT_FOUND" };

        const userInThisTournament = teamData?.users?.find(u => u.id === currentUserId && u.tournamentId === tournamentId);
        if (!userInThisTournament?.isLeader) return { can: false, reason: "NOT_LEADER" };

        const hasStarted = !["DRAFT", "REGISTRATION"].includes(tournamentGroup.status);
        if (hasStarted) return { can: false, reason: "TOURNAMENT_STARTED" };

        return { can: true, reason: "LEADER_BEFORE_START" };
    }, [teamData, currentUserId, isAdmin, membersByTournament]);

    return {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember,
        handleDeleteMember, handlePromote,
        errors, clearErrors: () => setErrors([]), isActionLoading,
        isEditingHeader, setIsEditingHeader, headerForm, setHeaderForm, handleUpdateTeam
    };
};