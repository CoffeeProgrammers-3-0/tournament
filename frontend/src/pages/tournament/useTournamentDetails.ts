import {type ChangeEvent, useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";

import {tournamentService} from "../../services/impl/TournamentService";
import {roundService} from "../../services/impl/RoundService";
import {teamService} from "../../services/impl/TeamService";

import type {RoundCreateRequestDto, RoundListResponseDto, RoundStatus} from "../../entities/round/round.dto.ts";
import type {TournamentFullResponseDto, TournamentUpdateRequestDto} from "../../entities/tournament/tournament.dto.ts";
import type {TeamListResponseDto} from "../../entities/team/team.dto.ts";

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

const toDateTimeLocal = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const useTournamentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const tournamentId = Number(id);

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [roundModalOpen, setRoundModalOpen] = useState(false);
    const [isCreatingRound, setIsCreatingRound] = useState(false);

    const [tournamentData, setTournamentData] = useState<TournamentFullResponseDto | null>(null);
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [rounds, setRounds] = useState<RoundListResponseDto[]>([]);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);

    const [selectedRoundStatus, setSelectedRoundStatus] = useState<RoundStatus>('ACTIVE');

    const [editFormData, setEditFormData] = useState<TournamentUpdateRequestDto>({
        name: "", description: "", startRegistration: "", endRegistration: "",
        startTournament: "", maxCountOfTeams: 0, countOfRounds: 0, status: "DRAFT"
    });

    const [roundFormData, setRoundFormData] = useState<RoundCreateRequestDto>({
        name: "", startDate: "", endDate: "", countOfWinners: 1, requirements: "", task: ""
    });

    const canEditFullInfo = isAdmin && tournamentData?.status === "DRAFT";

    const fetchRounds = useCallback(async () => {
        if (!tournamentId) return;
        setLoadingTab(true);
        try {
            const res = await roundService.getRoundsByTournament(tournamentId, { page: 0, size: 100, status: selectedRoundStatus });
            setRounds(res.content);
        } catch (e) { console.error(e); }
        finally { setLoadingTab(false); }
    }, [tournamentId, selectedRoundStatus]);

    const fetchTeams = useCallback(async () => {
        if (!tournamentId) return;
        setLoadingTab(true);
        try {
            const res = await teamService.getTeamsByTournament(tournamentId, { page: 0, size: 100 });
            setTeams(res.content);
        } catch (e) { console.error(e); }
        finally { setLoadingTab(false); }
    }, [tournamentId]);

    useEffect(() => {
        if (!tournamentId) return;
        const init = async () => {
            setLoading(true);
            try {
                const data = await tournamentService.getTournamentById(tournamentId);
                setTournamentData(data);
                setEditFormData({
                    name: data.name,
                    description: data.description,
                    startRegistration: data.startRegistration?.substring(0, 16) || "",
                    endRegistration: data.endRegistration?.substring(0, 16) || "",
                    startTournament: data.startTournament?.substring(0, 16) || "",
                    maxCountOfTeams: data.maxCountOfTeams,
                    countOfRounds: data.countOfRounds,
                    status: data.status,
                });
                if (isLoggedIn && !isAdmin) {
                    setIsUserRegistered(await teamService.checkIfRegistered(tournamentId));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        init();
    }, [tournamentId, isLoggedIn, isAdmin]);

    useEffect(() => {
        if (tabValue === 1) fetchRounds();
        if (tabValue === 2) fetchTeams();
    }, [tabValue, fetchRounds, fetchTeams]);

    const handleSaveUpdate = async () => {
        if (!tournamentId) return;
        try {
            const payload = {
                ...editFormData,
                startRegistration: formatToLocalDateTime(editFormData.startRegistration),
                endRegistration: formatToLocalDateTime(editFormData.endRegistration),
                startTournament: formatToLocalDateTime(editFormData.startTournament),
            };
            const updated = await tournamentService.updateTournament(tournamentId, payload as TournamentUpdateRequestDto);
            setTournamentData(updated);
            setIsEditingInfo(false);
        } catch (e) { console.error(e); }
    };

    const handleCreateRound = async () => {
        if (!tournamentId) return;
        setIsCreatingRound(true);
        try {
            await roundService.createRound(tournamentId, {
                ...roundFormData,
                startDate: formatToLocalDateTime(roundFormData.startDate),
                endDate: formatToLocalDateTime(roundFormData.endDate)
            });
            setRoundModalOpen(false);
            setRoundFormData({ name: "", startDate: "", endDate: "", countOfWinners: 1, requirements: "", task: "" });
            fetchRounds();
        } catch (e) { console.error(e); }
        finally { setIsCreatingRound(false); }
    };

    const handleRoundFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRoundFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (newStatus: string) => {
        const now = new Date();

        // Копіюємо поточні дати з форми або ставимо "зараз"
        let startReg = editFormData.startRegistration ? new Date(editFormData.startRegistration) : new Date(now);
        let endReg = editFormData.endRegistration ? new Date(editFormData.endRegistration) : new Date(now.getTime() + 86400000); // +1 день
        let startTour = editFormData.startTournament ? new Date(editFormData.startTournament) : new Date(endReg.getTime() + 3600000); // +1 година після рег

        if (newStatus === "DRAFT") {
            // Майбутній час для всього
            if (startReg <= now) {
                startReg = new Date(now.getTime() + 3600000); // через годину
                endReg = new Date(startReg.getTime() + 86400000 * 2);
                startTour = new Date(endReg.getTime() + 3600000);
            }
        } else if (newStatus === "REGISTRATION") {
            // Початок реєстрації має бути в минулому/зараз, кінець — у майбутньому
            if (startReg > now) startReg = new Date(now.getTime() - 60000);
            if (endReg <= now) endReg = new Date(now.getTime() + 86400000);
            if (startTour <= endReg) startTour = new Date(endReg.getTime() + 3600000);
        } else if (newStatus === "RUNNING") {
            // Реєстрація закінчена, турнір почався
            if (endReg > now) endReg = new Date(now.getTime() - 60000);
            if (startReg >= endReg) startReg = new Date(endReg.getTime() - 86400000);
            if (startTour > now) startTour = new Date(now.getTime() - 60000);
        } else if (newStatus === "FINISHED") {
            // Все в минулому
            if (startTour > now) startTour = new Date(now.getTime() - 120000);
            if (endReg >= startTour) endReg = new Date(startTour.getTime() - 60000);
            if (startReg >= endReg) startReg = new Date(endReg.getTime() - 86400000);
        }

        setEditFormData(prev => ({
            ...prev,
            status: newStatus as any,
            startRegistration: toDateTimeLocal(startReg),
            endRegistration: toDateTimeLocal(endReg),
            startTournament: toDateTimeLocal(startTour)
        }));
    };

    return {
        tournamentId, isAdmin, isLoggedIn, loading, loadingTab,
        tabValue, setTabValue, isEditingInfo, setIsEditingInfo,
        tournamentData, isUserRegistered, rounds, teams,
        selectedRoundStatus, setSelectedRoundStatus,
        editFormData, setEditFormData, roundFormData, handleRoundFormChange,
        handleSaveUpdate, handleCreateRound, roundModalOpen, setRoundModalOpen,
        isCreatingRound, canEditFullInfo, handleStatusChange
    };
};