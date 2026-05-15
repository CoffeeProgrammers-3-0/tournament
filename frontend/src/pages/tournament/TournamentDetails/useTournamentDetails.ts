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

    const [loading, setLoading] = useState<boolean>(true);
    const [loadingTab, setLoadingTab] = useState<boolean>(false);
    const [tournamentData, setTournamentData] = useState<TournamentFullResponseDto | null>(null);
    const [rounds, setRounds] = useState<RoundListResponseDto[]>([]);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);

    const [tabValue, setTabValue] = useState<number>(0);
    const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<Partial<TournamentUpdateRequestDto>>({});
    const [selectedRoundStatus, setSelectedRoundStatus] = useState<RoundStatus>("ACTIVE");
    
    const isAdmin = Cookies.get("role") === "ADMIN";
    const isLoggedIn = Cookies.get("role") !== undefined;
    const [isUserRegistered, setIsUserRegistered] = useState<boolean>(false);

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
    
    const fetchTournament = useCallback(async () => {
        setLoading(true);
        const id = Number(tournamentId);

        if (!tournamentId || isNaN(id) || id < 1) {
            window.location.replace('/404');
            return;
        }
        try {
            let response: TournamentFullResponseDto | null = null;
            if(isAdmin) {
                response = await tournamentService.getTournamentByIdAdmin(tournamentId);
            }
            else {
                response = await tournamentService.getTournamentById(tournamentId);
            }
            setTournamentData(response);
            setEditFormData({
                ...response,
                startRegistration: toLocalInput(response.startRegistration),
                endRegistration: toLocalInput(response.endRegistration),
                startTournament: toLocalInput(response.startTournament),
            });
            
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

    
    useEffect(() => {
        const fetchTabData = async () => {
            if (!tournamentId) return;
            setLoadingTab(true);
            try {
                if (tabValue === 1) { 
                    const response = await roundService.getRoundsByTournament(tournamentId, {
                        page: 0,
                        size: 50,
                        status: selectedRoundStatus
                    });
                    setRounds(response.content);
                } else if (tabValue === 2) { 
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
                ...tournamentData,
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

    
    const handleRoundFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRoundFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateRound = async () => {
        if (!tournamentId) return;
        clearErrors();
        setIsCreatingRound(true);
        try {
            
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