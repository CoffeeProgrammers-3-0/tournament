import {useCallback, useEffect, useState} from 'react';
import {userService} from '../../../services/impl/UserService';
import {teamService} from '../../../services/impl/TeamService';
import {tournamentService} from '../../../services/impl/TournamentService';
import type {UserResponseDto} from "../../../entities/user/user.dto.ts";
import type {TeamListResponseDto} from "../../../entities/team/team.dto.ts";
import type {TournamentListResponseDto} from "../../../entities/tournament/tournament.dto.ts";
import {certificateService} from "../../../services/impl/CertificateService.ts";
import type {CertificateResponseDto} from "../../../entities/certificate/certificate.dto.ts";

const PAGE_SIZE = 8;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

const API_CONFIG = {
    BASE_URL: API_BASE.replace(/\/api\/?$/, '')
};

export const useProfile = () => {
    const [user, setUser] = useState<UserResponseDto | null>(null);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);
    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [loadingMy, setLoadingMy] = useState(false);
    const [myTotalPages, setMyTotalPages] = useState(0);
    const [myPage, setMyPage] = useState(0);

    const [myCertificates, setMyCertificates] = useState<CertificateResponseDto[]>([]);

    const downloadCertificate = useCallback((certificate: CertificateResponseDto) => {
        if (certificate.status !== 'READY' && !(user?.role === "ADMIN")) return;

        const path = certificate.file?.path;
        if (!path) return;

        const fullUrl = `${API_CONFIG.BASE_URL}${path}`;

        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank';
        link.rel = 'noreferrer';

        document.body.appendChild(link);
        link.click();
        link.remove();
    }, []);

    const fetchMyCertificates = useCallback(async () => {
        setLoadingMy(true);
        try {
            const response = user?.role === "ADMIN" ? await certificateService.getCreatedByMeCertificates({
                    page: myPage,
                    size: PAGE_SIZE,})
                : await certificateService.getMyCertificates({
                    page: myPage,
                    size: PAGE_SIZE,});
            setMyCertificates(response.content);
            setMyTotalPages(response.totalPages);
        } finally {
            setLoadingMy(false);
        }
    }, [myPage]);

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
            setTeams(teamsData?.content || []);
            setTournaments(tournamentsData?.content || []);
            fetchMyCertificates();
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
        isSaving, handleSaveProfile, cancelEditing,
        myCertificates,
        setMyPage, myPage, myTotalPages, loadingMy, downloadCertificate
    };
};