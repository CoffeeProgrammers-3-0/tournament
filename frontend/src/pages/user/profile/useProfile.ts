import {useCallback, useEffect, useState} from 'react';
import {userService} from '../../../services/impl/UserService';
import {teamService} from '../../../services/impl/TeamService';
import {tournamentService} from '../../../services/impl/TournamentService';
import type {UserResponseDto} from "../../../entities/user/user.dto.ts";
import type {TeamListResponseDto} from "../../../entities/team/team.dto.ts";
import type {TournamentListResponseDto} from "../../../entities/tournament/tournament.dto.ts";

export const useProfile = () => {
    const [user, setUser] = useState<UserResponseDto | null>(null);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);
    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const [userData, teamsData, tournamentsData] = await Promise.all([
                userService.getMyProfile(),
                teamService.getMyTeams({ page: 0, size: 5 }),
                tournamentService.getMyTournaments({ page: 0, size: 5, status: 'RUNNING' })
            ]);

            setUser(userData);
            setEditName(userData.fullName);
            setTeams(teamsData?.content || []); // Використовуємо items згідно з твоїми DTO
            setTournaments(tournamentsData?.content || []);
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            setIsSaving(true);
            const updatedUser = await userService.updateUser(user.id, { fullName: editName });
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditName(user?.fullName || "");
    };

    return {
        user, teams, tournaments, loading,
        isEditing, setIsEditing, editName, setEditName,
        isSaving, handleSaveProfile, cancelEditing
    };
};