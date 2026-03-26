import {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {tournamentService} from '../../../services/impl/TournamentService';
import {roundService} from "../../../services/impl/RoundService";
import {teamService} from "../../../services/impl/TeamService";

import type {RoundListResponseDto, RoundStatus} from '../../../entities/round/round.dto';
import type {TournamentFullResponseDto, TournamentUpdateRequestDto} from "../../../entities/tournament/tournament.dto";
import type {TeamListResponseDto} from "../../../entities/team/team.dto";
import Cookies from "js-cookie";

export const useTournamentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const tournamentId = Number(id);

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
    const handleStatusChange = (newStatus: string) => {
        setEditFormData(prev => ({ ...prev, status: newStatus as any }));
    };

    const handleSaveUpdate = async () => {
        if (!tournamentId) return;
        try {
            const updated = await tournamentService.updateTournament(tournamentId, editFormData as TournamentUpdateRequestDto);
            setTournamentData(updated);
            setIsEditingInfo(false);
        } catch (error) {
            console.error("Помилка оновлення турніру", error);
        }
    };

    // --- ХЕНДЛЕРИ РАУНДІВ ---
    const handleRoundFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRoundFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateRound = async () => {
        if (!tournamentId) return;
        setIsCreatingRound(true);
        try {
            await roundService.createRound(tournamentId, roundFormData as any);
            setRoundModalOpen(false);
            setRoundFormData({ name: '', startDate: '', endDate: '', countOfWinners: 1, requirements: '', task: '' });

            // Оновлюємо список раундів, якщо зараз відкрита ця вкладка
            if (tabValue === 1) {
                const response = await roundService.getRoundsByTournament(tournamentId, { page: 0, size: 50, status: selectedRoundStatus });
                setRounds(response.content);
            }
        } catch (error) {
            console.error("Помилка створення раунду", error);
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
        handleStatusChange,
        handleSaveUpdate,
        selectedRoundStatus,
        setSelectedRoundStatus,
        roundModalOpen,
        setRoundModalOpen,
        roundFormData,
        handleRoundFormChange,
        handleCreateRound,
        isCreatingRound
    };
};