import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {tournamentService} from '../../../services/impl/TournamentService';
import {roundService} from "../../../services/impl/RoundService";
import {teamService} from "../../../services/impl/TeamService";

import type {RoundListResponseDto, RoundStatus} from '../../../entities/round/round.dto';
import type {TournamentFullResponseDto, TournamentUpdateRequestDto} from "../../../entities/tournament/tournament.dto";
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

    type colors = "primary" | "secondary" | "error" | "warning" | "info" | "success";

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        confirmColor?: colors;
        isLoading: boolean;
    }>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => {},
        isLoading: false
    });

    const closeDialog = () => setConfirmDialog(prev => ({ ...prev, open: false, isLoading: false }));

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

    const handleStatusAction = (
        serviceMethod: (id: number) => Promise<any>,
        config: { title: string; desc: string; color?: colors; isDelete?: boolean }
    ) => {
        setConfirmDialog({
            open: true,
            title: config.title,
            description: config.desc,
            confirmColor: config.color,
            isLoading: false,
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, isLoading: true }));
                try {
                    await serviceMethod(tournamentId);
                    if (config.isDelete) return navigate('/tournaments');
                    await fetchTournament();
                    setConfirmDialog(prev => ({ ...prev, open: false }));
                } catch (err: any) {
                    setErrors(err.response?.data?.messages || ["Помилка виконання операції"]);
                    setConfirmDialog(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const handleSaveUpdate = async () => {
        setErrors([]);
        try {
            const payload: TournamentUpdateRequestDto = {
                ...(editFormData as TournamentUpdateRequestDto),
                startRegistration: toUtcIso(editFormData.startRegistration!),
                endRegistration: toUtcIso(editFormData.endRegistration!),
                startTournament: toUtcIso(editFormData.startTournament!),
            };
            const updated = await tournamentService.updateTournament(tournamentId, payload);
            setTournamentData(updated);
            setIsEditingInfo(false);
        } catch (err: any) {
            setErrors(err.response?.data?.messages || ["Помилка оновлення"]);
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
        selectedRoundStatus,
        setSelectedRoundStatus,
        roundModalOpen,
        setRoundModalOpen,
        roundFormData,
        handleRoundFormChange,
        handleCreateRound,
        isCreatingRound,
        confirmDialog,
        closeDialog,
        handleStatusAction,
        handleSaveUpdate,
        errors,
        setErrors,
        clearErrors
    };
};