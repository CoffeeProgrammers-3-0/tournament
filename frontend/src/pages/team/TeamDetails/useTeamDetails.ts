import {useCallback, useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import type {TeamFullResponseDto} from "../../../entities/team/team.dto.ts";
import type {UserCreateRequestForTeamDto} from "../../../entities/user/user.dto.ts";

export const useTeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const currentUserId = Number(Cookies.get("userId") || 0);
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const fetchTeam = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await teamService.getTeamById(Number(id));
            setTeamData(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchTeam(); }, [fetchTeam]);

    // Групуємо учасників за турнірами
    const membersByTournament = useMemo(() => {
        if (!teamData?.users) return {};
        return teamData.users.reduce((acc: any, user) => {
            const tId = user.tournamentId;
            if (!acc[tId]) {
                acc[tId] = {
                    name: user.tournamentName,
                    members: []
                };
            }
            acc[tId].members.push(user);
            return acc;
        }, {});
    }, [teamData]);

    // Перевірка: чи є користувач лідером у конкретному турнірі
    const canManageTournament = useCallback((tournamentId: number) => {
        if (isAdmin) return true;
        return !!teamData?.users?.find(u =>
            u.id === currentUserId &&
            u.isLeader &&
            u.tournamentId === tournamentId
        );
    }, [teamData, currentUserId, isAdmin]);

    const handleAddMember = async (member: UserCreateRequestForTeamDto) => {
        if (!teamData) return;
        const updated = await teamService.addMember(teamData.id, member);
        setTeamData(updated);
    };

    const handleDeleteMember = async (userId: number) => {
        if (!teamData) return;
        const updated = await teamService.removeMember(teamData.id, userId);
        setTeamData(updated);
    };

    const handlePromote = async (userId: number) => {
        if (!teamData) return;
        const updated = await teamService.setTeamLeader(teamData.id, userId);
        setTeamData(updated);
    };

    return {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember, handleDeleteMember, handlePromote
    };
};