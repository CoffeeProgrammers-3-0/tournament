import {useCallback, useMemo, useState} from "react";
import {roundService} from "../../../../../services/impl/RoundService";
import {teamService} from "../../../../../services/impl/TeamService.ts";
import type {StatisticResponseDto} from "../../../../../entities/team/team.dto.ts";

export const useRoundTeamsManager = ({
                                         roundId,
                                         leaderboard,
                                         fetchSubmissions,
                                         clearErrors,
                                         handleError,
                                         triggerConfirm,
                                         closeConfirm,
                                         myTeamId,
                                         isAdmin,
                                         t
                                     }: any) => {

    const [addMissingModalOpen, setAddMissingModalOpen] = useState(false);
    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);

    const [missingTeams, setMissingTeams] = useState<any[]>([]);
    const [selectedMissingIds, setSelectedMissingIds] = useState<number[]>([]);

    const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<number[]>([]);
    const [targetAdvanceRoundId, setTargetAdvanceRoundId] = useState<number | null>(null);
    const [tournamentRounds, setTournamentRounds] = useState<any[]>([]);

    const [isTeamsLoading, setIsTeamsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");

    const handleOpenAddMissingModal = useCallback(async () => {
        if (typeof clearErrors === 'function') clearErrors();
        setIsTeamsLoading(true);
        setAddMissingModalOpen(true);

        try {
            const res = await roundService.getTeamsNotInRound(roundId, { page: 0, size: 500 });
            setMissingTeams(res.content || []);
        } catch (e) {
            if (typeof handleError === 'function') handleError(e, "Помилка завантаження команд");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [clearErrors, handleError, roundId]);

    const handleConfirmAddMissing = useCallback(async () => {
        if (!selectedMissingIds.length) return;

        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(roundId, selectedMissingIds);
            await fetchSubmissions();
            setAddMissingModalOpen(false);
        } catch (e) {
            if (typeof handleError === 'function') handleError(e, "Помилка додавання");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [selectedMissingIds, roundId, fetchSubmissions, handleError]);

    const handleOpenAdvanceModal = useCallback(async () => {
        setAdvanceModalOpen(true);

        try {
            const rounds = await roundService.getRoundsByRound(roundId, { page: 0, size: 100, status: 'DRAFT' });
            setTournamentRounds(rounds.content);

            const topIds = leaderboard.slice(0, 3).map((t: any) => t.id);
            setSelectedAdvanceIds(topIds);
        } catch (e) {
            if (typeof handleError === 'function') handleError(e, t('round_details.errors.loadStats'));
        }
    }, [leaderboard, roundId, t, handleError]);

    const handleConfirmAdvance = useCallback(async () => {
        if (!targetAdvanceRoundId) return;

        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(targetAdvanceRoundId, selectedAdvanceIds);
            setAdvanceModalOpen(false);
        } catch (e) {
            if (typeof handleError === 'function') handleError(e, "Помилка переведення");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [targetAdvanceRoundId, selectedAdvanceIds, handleError]);

    const handleUnassignTeam = useCallback((teamId: number) => {
        triggerConfirm({
            title: t('round_details.confirm.removeTeam.title'),
            description: t('round_details.confirm.removeTeam.description'),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundService.unassignTeams(roundId, [teamId]);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    if (typeof handleError === 'function') handleError(e, "Помилка видалення");
                }
            }
        });
    }, [t, triggerConfirm, roundId, fetchSubmissions, closeConfirm, handleError]);

    const handleOpenStats = useCallback(async (teamId: number, e?: React.MouseEvent) => {
        // Fallback catch incase propogation didn't trigger
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }

        if (!roundId) return;

        // Fix: If clearErrors is missing/undefined, executing it normally would crash the function silently.
        if (typeof clearErrors === 'function') {
            clearErrors();
        }

        try {
            let stats;
            if (isAdmin) {
                stats = await teamService.getTeamStats(teamId, roundId);
            } else if (String(teamId) === String(myTeamId)) { // Fix: Enforce string coercion
                stats = await teamService.getMyTeamStats(roundId);
            } else {
                return;
            }
            setSelectedStats(stats);
            setStatsModalOpen(true);
        } catch (error: any) {
            // Fix: Fallback for unhandled promise rejection missing handleError
            if (typeof handleError === 'function') {
                handleError(error, t('round_details.errors.loadStats'));
            } else {
                console.error("Failed to load stats:", error);
            }
        }
    }, [roundId, isAdmin, myTeamId, clearErrors, handleError, t]);

    const handleExportLeaderboard = useCallback(async () => {
        if (!roundId) return;
        setIsExporting(true);
        if (typeof clearErrors === 'function') clearErrors();

        try {
            const blob = await roundService.exportLeaderboard(roundId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `leaderboard_round_${roundId}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            if (typeof handleError === 'function') handleError(error, "Помилка експорту лідерборду");
            triggerConfirm({ title: "Export Failed", description: "Failed to download leaderboard file.", confirmColor: "error", onConfirm: closeConfirm });
        } finally {
            setIsExporting(false);
        }
    }, [roundId, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const aggregatedCriteria = useMemo(() => {
        if (!selectedStats) return { criteriaSums: {}, totalAdditional: 0, grandTotal: 0 };

        const criteriaSums: Record<string, { totalPoints: number; totalBonus: number; count: number }> = {};
        let grandTotal = 0;

        if (selectedStats.pointsPerJury) {
            Object.values(selectedStats.pointsPerJury).forEach(juryScores => {
                if (!juryScores) return;
                Object.entries(juryScores).forEach(([criteria, pointData]) => {
                    if (!criteriaSums[criteria]) criteriaSums[criteria] = { totalPoints: 0, totalBonus: 0, count: 0 };
                    criteriaSums[criteria].totalPoints += pointData.points || 0;
                    criteriaSums[criteria].count += 1;
                    grandTotal += pointData.points || 0;
                });
            });
        }

        if (selectedStats.additionalPointsPerJury) {
            Object.values(selectedStats.additionalPointsPerJury).forEach(juryBonus => {
                if (!juryBonus) return;
                Object.entries(juryBonus).forEach(([criteria, bonusPoints]) => {
                    if (!criteriaSums[criteria]) criteriaSums[criteria] = { totalPoints: 0, totalBonus: 0, count: 0 };
                    criteriaSums[criteria].totalBonus += bonusPoints || 0;
                    grandTotal += bonusPoints || 0;
                });
            });
        }

        return { criteriaSums, grandTotal };
    }, [selectedStats]);

    const juryList = useMemo(() => {
        if (!selectedStats) return [];
        const juries = new Set<string>();
        if (selectedStats.pointsPerJury) Object.keys(selectedStats.pointsPerJury).forEach(j => juries.add(j));
        if (selectedStats.additionalPointsPerJury) Object.keys(selectedStats.additionalPointsPerJury).forEach(j => juries.add(j));
        return Array.from(juries);
    }, [selectedStats]);

    const criteriaList = useMemo(() => Object.keys(aggregatedCriteria.criteriaSums), [aggregatedCriteria]);

    const handleAssignAllTeams = useCallback(() => {
        triggerConfirm({
            title: t('round_details.confirm.assignAllTeams.title'),
            description: t('round_details.confirm.assignAllTeams.description'),
            confirmColor: "primary",
            onConfirm: async () => {
                setIsTeamsLoading(true);
                try {
                    await roundService.assignAllTeams(roundId);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    if (typeof handleError === 'function') handleError(e, "Помилка додавання всіх команд");
                } finally {
                    setIsTeamsLoading(false);
                }
            }
        });
    }, [roundId, t, triggerConfirm, closeConfirm, fetchSubmissions, handleError]);

    const handleUnassignAllTeams = useCallback(() => {
        triggerConfirm({
            title: t('round_details.confirm.unassignAllTeams.title'),
            description: t('round_details.confirm.unassignAllTeams.description'),
            confirmColor: "error",
            onConfirm: async () => {
                setIsTeamsLoading(true);
                try {
                    await roundService.unassignAllTeams(roundId);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    if (typeof handleError === 'function') handleError(e, "Помилка видалення всіх команд");
                } finally {
                    setIsTeamsLoading(false);
                }
            }
        });
    }, [roundId, t, triggerConfirm, closeConfirm, fetchSubmissions, handleError]);

    return {
        addMissingModalOpen, setAddMissingModalOpen,
        advanceModalOpen, setAdvanceModalOpen,

        missingTeams,
        selectedMissingIds, setSelectedMissingIds,

        selectedAdvanceIds, setSelectedAdvanceIds,
        targetAdvanceRoundId, setTargetAdvanceRoundId,
        tournamentRounds,

        isTeamsLoading,

        handleOpenAddMissingModal,
        handleConfirmAddMissing,
        handleOpenAdvanceModal,
        handleConfirmAdvance,
        handleUnassignTeam,

        handleOpenStats,
        selectedStats,
        statsModalOpen,
        setStatsModalOpen,

        handleExportLeaderboard,
        isExporting,
        statsViewMode,
        setStatsViewMode,

        aggregatedCriteria,
        juryList,
        criteriaList,

        handleAssignAllTeams,
        handleUnassignAllTeams,
    };
};