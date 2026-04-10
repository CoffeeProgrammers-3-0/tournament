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
        if (!tournamentId) return;
        setLoading(true);
        try {
            const response = await tournamentService.getTournamentById(tournamentId);
            setTournamentData(response);
            setEditFormData(response);

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

    // --- ХЕНДЛЕРИ ТУРНІРУ ---
    const handleStatusChange = (newStatus: TournamentStatus) => {
        // Функція-хелпер для отримання локальної дати у форматі YYYY-MM-DDTHH:mm
        const getLocalDateTime = (date: Date) => {
            const offset = date.getTimezoneOffset() * 60000; // зміщення в мілісекундах
            const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
            return localISOTime;
        };

        const nowDate = new Date();
        const nowStr = getLocalDateTime(nowDate);

        // Додаємо 24 години (86400000 мс)
        const tomorrowDate = new Date(nowDate.getTime() + 86400000);
        const tomorrowStr = getLocalDateTime(tomorrowDate);

        setEditFormData(prev => {
            const updated = { ...prev, status: newStatus };

            switch (newStatus) {
                case 'REGISTRATION':
                    updated.startRegistration = nowStr;
                    updated.endRegistration = tomorrowStr;
                    updated.startTournament = tomorrowStr;
                    break;

                case 'RUNNING':
                    updated.startTournament = nowStr;
                    updated.endRegistration = nowStr;
                    break;

                case 'FINISHED':
                    // Можна зафіксувати дату завершення, якщо є таке поле
                    break;
            }
            return updated;
        });
    };

    const formatToFullISO = (dateStr: string) => {
        if (!dateStr) return dateStr;
        return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
    };

    const handleSaveUpdate = async () => {
        if (!tournamentId) return;
        clearErrors();
        try {
            // Формуємо payload, додаючи секунди до всіх дат
            const payload: TournamentUpdateRequestDto = {
                ...(editFormData as TournamentUpdateRequestDto),
                startRegistration: formatToFullISO(editFormData.startRegistration as string),
                endRegistration: formatToFullISO(editFormData.endRegistration as string),
                startTournament: formatToFullISO((editFormData.endRegistration ?? editFormData.startTournament) as string) as string,
            };

            const updated = await tournamentService.updateTournament(tournamentId, payload);
            setTournamentData(updated);
            setIsEditingInfo(false);
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
            roundFormData.startDate = roundFormData.startDate + ":00";
            roundFormData.endDate = roundFormData.endDate + ":00";
            await roundService.createRound(tournamentId, roundFormData as any);
            setRoundModalOpen(false);
            setRoundFormData({ name: '', startDate: '', endDate: '', countOfWinners: 1, requirements: '', task: '' });
            // ... оновлення списку ...
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