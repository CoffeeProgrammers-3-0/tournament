import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {tournamentService} from '../../../services/impl/TournamentService';
import {roundService} from "../../../services/impl/RoundService";
import {teamService} from "../../../services/impl/TeamService";

import type {RoundListResponseDto, RoundStatus} from '../../../entities/round/round.dto';
import type {
    TournamentFullResponseDto,
    TournamentStatus,
    TournamentUpdateRequestDto
} from "../../../entities/tournament/tournament.dto";
import type {TeamListResponseDto} from "../../../entities/team/team.dto";
import Cookies from "js-cookie";
import {toLocalInput, toUtcIso} from "../../../utils/data.ts";

export const useTournamentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const tournamentId = Number(id);
    const navigate = useNavigate();

    const [errors, setErrors] = useState<string[]>([]);
    const clearErrors = () => setErrors([]);

    // --- СТАН ДАНИХ ---
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingTab, setLoadingTab] = useState<boolean>(false);
    const [tournamentData, setTournamentData] = useState<TournamentFullResponseDto | null>(null);
    const [rounds, setRounds] = useState<RoundListResponseDto[]>([]);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);

    // --- UI СТАНИ ---
    const [tabValue, setTabValue] = useState<number>(0);
    const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<Partial<TournamentUpdateRequestDto>>({});
    const [selectedRoundStatus, setSelectedRoundStatus] = useState<RoundStatus>("ACTIVE");

    // --- АВТОРИЗАЦІЯ (Тут має бути ваш Auth Context) ---
    const isAdmin = Cookies.get("role") === "ADMIN";
    const isLoggedIn = Cookies.get("role") !== undefined;
    const [isUserRegistered, setIsUserRegistered] = useState<boolean>(false);

    // --- СТАН МОДАЛКИ РАУНДУ ---
    const [roundModalOpen, setRoundModalOpen] = useState<boolean>(false);
    const [isCreatingRound, setIsCreatingRound] = useState<boolean>(false);
    const [roundFormData, setRoundFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        countOfWinners: 1,
        requirements: '',
        task: ''
    });

    // 1. Завантаження основних даних турніру
    const fetchTournament = useCallback(async () => {
        setLoading(true);
        const id = Number(tournamentId);

        if (!tournamentId || isNaN(id) || id < 1) {
            window.location.replace('/404');
            return;
        }
        try {
            const response = await tournamentService.getTournamentById(tournamentId);
            setTournamentData(response);
            setEditFormData({
                ...response,
                startRegistration: toLocalInput(response.startRegistration),
                endRegistration: toLocalInput(response.endRegistration),
                startTournament: toLocalInput(response.startTournament),
            });

            // Перевірка чи поточний юзер зареєстрований
            if (isLoggedIn) {
                const registered = await teamService.checkIfRegistered(tournamentId);
                setIsUserRegistered(registered);
            }
        } catch (error) {
            console.error("Помилка завантаження турніру", error);
        } finally {
            setLoading(false);
        }
    }, [tournamentId, isLoggedIn]);

    useEffect(() => {
        fetchTournament();
    }, [fetchTournament]);

    // 2. Завантаження даних для вкладок (Раунди / Команди)
    useEffect(() => {
        const fetchTabData = async () => {
            if (!tournamentId) return;
            setLoadingTab(true);
            try {
                if (tabValue === 1) { // Раунди
                    const response = await roundService.getRoundsByTournament(tournamentId, {
                        page: 0,
                        size: 50,
                        status: selectedRoundStatus
                    });
                    setRounds(response.content);
                } else if (tabValue === 2) { // Команди
                    const response = await teamService.getTeamsByTournament(tournamentId, {
                        page: 0,
                        size: 100
                    });
                    setTeams(response.content);
                }
            } catch (error) {
                console.error("Помилка завантаження вкладок", error);
            } finally {
                setLoadingTab(false);
            }
        };

        fetchTabData();
    }, [tabValue, tournamentId, selectedRoundStatus]);

    const handleStatusChange = (newStatus: TournamentStatus) => {
        setEditFormData(prev => {

            let sReg = prev.startRegistration ? new Date(toUtcIso(prev.startRegistration)) : new Date();
            let eReg = prev.endRegistration ? new Date(toUtcIso(prev.endRegistration)) : new Date(sReg.getTime() + 86400000);
            let sTour = prev.startTournament ? new Date(toUtcIso(prev.startTournament)) : new Date(eReg.getTime() + 86400000);
            const now = new Date();

            switch (newStatus) {
                case 'REGISTRATION':
                    // Registration must be actively running
                    if (sReg > now) sReg = new Date(now.getTime() - 60000); // Adjust to just started
                    if (eReg <= now) eReg = new Date(now.getTime() + 86400000); // Adjust to end tomorrow
                    if (sTour <= eReg) sTour = new Date(eReg.getTime() + 3600000); // Ensure tour starts AFTER reg ends
                    break;

                case 'RUNNING':
                    // Tournament must be active, registration must be closed
                    if (eReg > now) eReg = new Date(now.getTime() - 3600000); // Close reg 1 hr ago
                    if (sReg >= eReg) sReg = new Date(eReg.getTime() - 86400000); // Ensure sReg makes sense
                    if (sTour > now) sTour = new Date(now.getTime() - 60000); // Start tour 1 min ago
                    break;

                case 'FINISHED':
                    // Everything must be in the past
                    if (sTour > now) sTour = new Date(now.getTime() - 86400000); // Set tour start to yesterday
                    if (eReg >= sTour) eReg = new Date(sTour.getTime() - 3600000);
                    if (sReg >= eReg) sReg = new Date(eReg.getTime() - 86400000);
                    break;
            }

            return {
                ...prev,
                status: newStatus,
                startRegistration: toLocalInput(sReg.toISOString()),
                endRegistration: toLocalInput(eReg.toISOString()),
                startTournament: toLocalInput(sTour.toISOString())
            };
        });
    };

    const handleSaveUpdate = async () => {
        if (!tournamentId) return;
        clearErrors();
        try {
            const payload: TournamentUpdateRequestDto = {
                ...(editFormData as TournamentUpdateRequestDto),
                startRegistration: toUtcIso(editFormData.startRegistration as string),
                endRegistration: toUtcIso(editFormData.endRegistration as string),
                startTournament: toUtcIso(editFormData.startTournament as string),
            };

            const updated = await tournamentService.updateTournament(tournamentId, payload);
            setTournamentData(updated);
            setIsEditingInfo(false);
            setEditFormData({
                ...updated,
                startRegistration: toLocalInput(updated.startRegistration),
                endRegistration: toLocalInput(updated.endRegistration),
                startTournament: toLocalInput(updated.startTournament),
            });
        } catch (error: any) {
            const messages = error.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Помилка оновлення турніру"]);
        }
    };

    // --- ХЕНДЛЕРИ РАУНДІВ ---
    const handleRoundFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRoundFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateRound = async () => {
        if (!tournamentId) return;
        clearErrors();
        setIsCreatingRound(true);
        try {
            // Convert to UTC before API call
            const payload = {
                ...roundFormData,
                startDate: toUtcIso(roundFormData.startDate),
                endDate: toUtcIso(roundFormData.endDate)
            };

            await roundService.createRound(tournamentId, payload as any);
            setRoundModalOpen(false);
            setRoundFormData({ name: '', startDate: '', endDate: '', countOfWinners: 1, requirements: '', task: '' });
        } catch (error: any) {
            const messages = error.response?.data?.messages;
            setErrors(Array.isArray(messages) ? messages : ["Помилка створення раунду"]);
        } finally {
            setIsCreatingRound(false);
        }
    };
    const handleDeleteTournament = useCallback(async () => {
        if (!tournamentId) return;

        // Додаємо підтвердження
        if (!window.confirm("Ви впевнені, що хочете видалити цей турнір? Цю дію неможливо скасувати.")) {
            return;
        }

        try {
            await tournamentService.deleteTournament(tournamentId);
            navigate('/tournaments'); // Перенаправляємо на список турнірів
        } catch (error) {
            console.error("Помилка видалення турніру", error);
        }
    }, [tournamentId, navigate]);

    return {
        tournamentId,
        tournamentData,
        rounds,
        teams,
        loading,
        loadingTab,
        tabValue,
        setTabValue,
        isAdmin,
        isLoggedIn,
        isUserRegistered,
        isEditingInfo,
        setIsEditingInfo,
        editFormData,
        setEditFormData,
        handleStatusChange,
        handleSaveUpdate,
        selectedRoundStatus,
        setSelectedRoundStatus,
        roundModalOpen,
        setRoundModalOpen,
        roundFormData,
        handleRoundFormChange,
        handleCreateRound,
        isCreatingRound,
        handleDeleteTournament,
        errors,
        setErrors,
        clearErrors
    };
};