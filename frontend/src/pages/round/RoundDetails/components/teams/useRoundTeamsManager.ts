import {useCallback, useMemo, useState} from "react";
import {roundService} from "../../../../services/impl/RoundService";
import {teamService} from "../../../../services/impl/TeamService.ts";
import type {StatisticResponseDto} from "../../../../entities/team/team.dto.ts";

export const useRoundTeamsManager = ({
                                         roundId,
                                         leaderboard,
                                         fetchSubmissions,
                                         clearErrors,
                                         handleError,
                                         triggerConfirm,
                                         closeConfirm,
                                     }: any) => {

    const [addMissingModalOpen, setAddMissingModalOpen] = useState(false);
    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);

    const [missingTeams, setMissingTeams] = useState<any[]>([]);
    const [selectedMissingIds, setSelectedMissingIds] = useState<number[]>([]);

    const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<number[]>([]);
    const [targetAdvanceRoundId, setTargetAdvanceRoundId] = useState<number | null>(null);
    const [tournamentRounds, setTournamentRounds] = useState<any[]>([]);

    const [isTeamsLoading, setIsTeamsLoading] = useState(false);

    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    const [isExporting, setIsExporting] = useState(false);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");

    const handleOpenAddMissingModal = useCallback(async () => {
        clearErrors();
        setIsTeamsLoading(true);
        setAddMissingModalOpen(true);

        try {
            const res = await roundService.getTeamsNotInRound(roundId, { page: 0, size: 500 });
            setMissingTeams(res.content || []);
        } catch (e) {
            handleError(e, "Помилка завантаження команд");
        } finally {
            setIsTeamsLoading(false);
        }
    }, []);

    const handleConfirmAddMissing = useCallback(async () => {
        if (!selectedMissingIds.length) return;

        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(roundId, selectedMissingIds);
            await fetchSubmissions();
            setAddMissingModalOpen(false);
        } catch (e) {
            handleError(e, "Помилка додавання");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [selectedMissingIds]);

    const handleOpenAdvanceModal = useCallback(async () => {
        setAdvanceModalOpen(true);

        try {
            const rounds = await roundService.getRoundsByRound(roundId, { page: 0, size: 100, status: 'DRAFT' });
            setTournamentRounds(rounds.content);

            const topIds = leaderboard.slice(0, 3).map((t: any) => t.id);
            setSelectedAdvanceIds(topIds);
        } catch (e) {
            handleError(e, "Помилка завантаження раундів");
        }
    }, [leaderboard]);

    const handleConfirmAdvance = useCallback(async () => {
        if (!targetAdvanceRoundId) return;

        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(targetAdvanceRoundId, selectedAdvanceIds);
            setAdvanceModalOpen(false);
        } catch (e) {
            handleError(e, "Помилка переведення");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [targetAdvanceRoundId, selectedAdvanceIds]);

    const handleUnassignTeam = useCallback((teamId: number) => {
        triggerConfirm({
            title: "Remove team?",
            description: "",
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundService.unassignTeams(roundId, [teamId]);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    handleError(e, "Помилка видалення");
                }
            }
        });
    }, []);

    const handleOpenStats = useCallback(async (teamId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!roundId) return;
        clearErrors();
        try {
            const stats = await teamService.getTeamStats(teamId, roundId);
            setSelectedStats(stats);
            setStatsModalOpen(true);
        } catch (error: any) {
            handleError(error, "Помилка завантаження статистики");
        }
    }, [roundId, clearErrors, handleError]);

    const handleExportLeaderboard = useCallback(async () => {
        if (!roundId) return;
        setIsExporting(true);
        clearErrors();
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
            handleError(error, "Помилка експорту лідерборду");
            triggerConfirm({ title: "Export Failed", description: "Failed to download leaderboard file.", confirmColor: "error", onConfirm: closeConfirm });
        } finally {
            setIsExporting(false);
        }
    }, [roundId, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const aggregatedCriteria = useMemo(() => {
        if (!selectedStats?.pointsPerJury) return {};
        const result: Record<string, { total: number; count: number }> = {};
        Object.values(selectedStats.pointsPerJury).forEach(juryScores => {
            if (!juryScores) return;
            Object.entries(juryScores).forEach(([criteria, points]) => {
                if (!result[criteria]) result[criteria] = { total: 0, count: 0 };
                result[criteria].total += points;
                result[criteria].count += 1;
            });
        });
        return result;
    }, [selectedStats]);

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
        juryList: selectedStats?.pointsPerJury ? Object.keys(selectedStats.pointsPerJury) : [],
        criteriaList: Object.keys(aggregatedCriteria),
    };
};