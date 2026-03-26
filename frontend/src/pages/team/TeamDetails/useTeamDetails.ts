import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {teamService} from "../../../services/impl/TeamService";
import type {TeamFullResponseDto, TeamUpdateRequestDto} from "../../../entities/team/team.dto.ts";
import type {UserCreateRequestForTeamDto} from "../../../entities/user/user.dto.ts";

export const useTeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const currentUserId = Number(Cookies.get("userId") || 0);
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const fetchTeam = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await teamService.getTeamById(Number(id));
            console.log(data)
            setTeamData(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchTeam(); }, [fetchTeam]);

    const isTeamLeader: boolean = !!teamData?.users?.find(u => u.id === currentUserId)?.isLeader;
    const canControl: boolean = isAdmin || isTeamLeader;

    const handleUpdate = async (payload: TeamUpdateRequestDto) => {
        if (!teamData) return;
        const updated = await teamService.updateTeam(teamData.id, payload);
        setTeamData(updated);
        setIsEditing(false);
    };

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
        teamData, loading, canControl, isAdmin, currentUserId,
        isEditing, setIsEditing, tabValue, setTabValue,
        handleUpdate, handleAddMember, handleDeleteMember, handlePromote
    };
};