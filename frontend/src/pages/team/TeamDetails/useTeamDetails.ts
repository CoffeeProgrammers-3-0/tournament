import {useCallback, useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import type {TeamFullResponseDto} from "../../../entities/team/team.dto";
import type {UserCreateRequestForTeamDto} from "../../../entities/user/user.dto";

export const useTeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const currentUserId = Number(Cookies.get("userId") || 0);
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    // Editing State
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [headerForm, setHeaderForm] = useState({ name: "", organization: "", email: "" });
    const [errors, setErrors] = useState<string[]>([]);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchTeam = useCallback(async () => {
        if (!id || isNaN(Number(id)) || Number(id) < 1) {
            window.location.replace('/404');
            return;
        }

        setLoading(true);
        try {
            const team = await teamService.getTeamById(Number(id));
            setTeamData(team);
            setHeaderForm({
                name: team.name,
                organization: team.organization || "",
                email: team.email
            });
        } catch (err) {
            console.error("Fetch error:", err);
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
        } catch (err: any) {
            const messages = err.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Failed to update team"]);
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    const membersByTournament = useMemo(() => {
        if (!teamData?.users) return {};
        return teamData.users.reduce((acc: any, user: any) => { // Тут user має тип UserResponseForTeamDto
            const tId = user.tournamentId;
            if (!acc[tId]) {
                acc[tId] = {
                    name: user.tournamentName,
                    status: user.tournamentStatus,
                    maxMembers: user.tournamentMaxCountOfTeam, // Додаємо ліміт з DTO
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

        // Дозволяємо керувати складом команди лише якщо турнір у статусі DRAFT або REGISTRATION
        // (Підставте ваші реальні статуси, якщо вони відрізняються)
        const hasStarted = !["DRAFT", "REGISTRATION"].includes(tournamentGroup.status);
        if (hasStarted) return { can: false, reason: "TOURNAMENT_STARTED" };

        return { can: true, reason: "LEADER_BEFORE_START" };
    }, [teamData, currentUserId, isAdmin, membersByTournament]);

    const handleAddMember = async (member: UserCreateRequestForTeamDto, tournamentId: number) => {
        if (!teamData) return;
        setErrors([]);
        setIsActionLoading(true);
        try {
            const updated = await teamService.addMember(teamData.id, tournamentId, member);
            setTeamData(updated);
            return true;
        } catch (err: any) {
            const messages = err.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Failed to add member"]);
            return false;
        } finally {
            setIsActionLoading(false);
        }
    };

    return {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember,
        handleDeleteMember: async (uId: number, tId: number) => {
            const updated = await teamService.removeMember(teamData!.id, uId, tId);
            setTeamData(updated);
        },
        handlePromote: async (uId: number, tId: number) => {
            const updated = await teamService.setTeamLeader(teamData!.id, uId, tId);
            setTeamData(updated);
        },
        errors, clearErrors: () => setErrors([]), isActionLoading,
        isEditingHeader, setIsEditingHeader, headerForm, setHeaderForm, handleUpdateTeam
    };
};