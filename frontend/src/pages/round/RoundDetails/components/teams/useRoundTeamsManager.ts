import {type MouseEvent, useCallback, useMemo, useState} from "react";
import {roundService} from "../../../../../services/impl/RoundService";
import {teamService} from "../../../../../services/impl/TeamService.ts";
import type {StatisticResponseDto} from "../../../../../entities/team/team.dto.ts";

type StatsViewMode = "aggregated" | "detailed";

export type PivotRow = {
    id: string;
    type: "category" | "criteria";
    categoryId: number;
    categoryTitle: string;
    label: string;
    depth: 0 | 1;
    average: number;
    juryValues: Record<string, number>;
    juryComments?: Record<string, string>;
    weight: number;
};

export type BonusRow = {
    id: string;
    jury: string;
    points: number;
    comment: string;
};

type Props = {
    roundId: number;
    leaderboard: Array<{ id: number }>;
    fetchSubmissions: () => Promise<void>;
    clearErrors?: () => void;
    handleError?: (error: unknown, message: string) => void;
    triggerConfirm: (config: {
        title: string;
        description: string;
        confirmColor: "primary" | "error" | "warning" | "success";
        onConfirm: () => Promise<void> | void;
    }) => void;
    closeConfirm: () => void;
    myTeamId: number | string;
    isAdmin: boolean;
    t: (key: string, options?: any) => string;
};

const average = (values: number[]) => {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
};

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
                                         t,
                                     }: Props) => {
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
    const [statsViewMode, setStatsViewMode] = useState<StatsViewMode>("aggregated");

    const handleCloseStats = useCallback(() => {
        setStatsModalOpen(false);
        setSelectedStats(null);
        setStatsViewMode("aggregated");
    }, []);

    const handleOpenAddMissingModal = useCallback(async () => {
        clearErrors?.();
        setIsTeamsLoading(true);
        setAddMissingModalOpen(true);

        try {
            const res = await roundService.getTeamsNotInRound(roundId, { page: 0, size: 500 });
            setMissingTeams(res.content || []);
        } catch (e) {
            handleError?.(e, "Помилка завантаження команд");
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
            handleError?.(e, "Помилка додавання");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [fetchSubmissions, handleError, roundId, selectedMissingIds]);

    const handleOpenAdvanceModal = useCallback(async () => {
        setAdvanceModalOpen(true);

        try {
            const rounds = await roundService.getRoundsByRound(roundId, {
                page: 0,
                size: 100,
                status: "DRAFT",
            });

            setTournamentRounds(rounds.content || []);
            setSelectedAdvanceIds(leaderboard.slice(0, 3).map((item: any) => item.id));
        } catch (e) {
            handleError?.(e, t("round_details.errors.loadStats"));
        }
    }, [handleError, leaderboard, roundId, t]);

    const handleConfirmAdvance = useCallback(async () => {
        if (!targetAdvanceRoundId) return;

        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(targetAdvanceRoundId, selectedAdvanceIds);
            setAdvanceModalOpen(false);
        } catch (e) {
            handleError?.(e, "Помилка переведення");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [handleError, selectedAdvanceIds, targetAdvanceRoundId]);

    const handleUnassignTeam = useCallback((teamId: number) => {
        triggerConfirm({
            title: t("round_details.confirm.removeTeam.title"),
            description: t("round_details.confirm.removeTeam.description"),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundService.unassignTeams(roundId, [teamId]);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    handleError?.(e, "Помилка видалення");
                }
            },
        });
    }, [closeConfirm, fetchSubmissions, handleError, roundId, t, triggerConfirm]);

    const handleAssignAllTeams = useCallback(() => {
        triggerConfirm({
            title: t("round_details.confirm.assignAllTeams.title"),
            description: t("round_details.confirm.assignAllTeams.description"),
            confirmColor: "primary",
            onConfirm: async () => {
                setIsTeamsLoading(true);
                try {
                    await roundService.assignAllTeams(roundId);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    handleError?.(e, "Помилка додавання всіх команд");
                } finally {
                    setIsTeamsLoading(false);
                }
            },
        });
    }, [closeConfirm, fetchSubmissions, handleError, roundId, t, triggerConfirm]);

    const handleUnassignAllTeams = useCallback(() => {
        triggerConfirm({
            title: t("round_details.confirm.unassignAllTeams.title"),
            description: t("round_details.confirm.unassignAllTeams.description"),
            confirmColor: "error",
            onConfirm: async () => {
                setIsTeamsLoading(true);
                try {
                    await roundService.unassignAllTeams(roundId);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    handleError?.(e, "Помилка видалення всіх команд");
                } finally {
                    setIsTeamsLoading(false);
                }
            },
        });
    }, [closeConfirm, fetchSubmissions, handleError, roundId, t, triggerConfirm]);

    const handleOpenStats = useCallback(async (teamId: number, e?: MouseEvent) => {
        e?.stopPropagation();

        if (!roundId) return;

        const canView = isAdmin || String(teamId) === String(myTeamId);
        if (!canView) return;

        clearErrors?.();
        setStatsModalOpen(true);
        setSelectedStats(null);

        try {
            const stats = isAdmin
                ? await teamService.getTeamStats(teamId, roundId)
                : await teamService.getMyTeamStats(roundId);

            setSelectedStats(stats);
        } catch (error) {
            handleError?.(error, t("round_details.errors.loadStats"));
        }
    }, [clearErrors, handleError, isAdmin, myTeamId, roundId, t]);

    const handleExportLeaderboard = useCallback(async () => {
        if (!roundId) return;

        setIsExporting(true);
        clearErrors?.();

        try {
            const blob = await roundService.exportLeaderboard(roundId);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `leaderboard_${roundId}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            handleError?.(error, "Помилка експорту");
        } finally {
            setIsExporting(false);
        }
    }, [clearErrors, handleError, roundId]);

    const juryList = useMemo(() => {
        if (!selectedStats) return [];

        const set = new Set<string>();

        selectedStats.juryEmails?.forEach((j) => set.add(j));
        Object.keys(selectedStats.pointsPerJury || {}).forEach((j) => set.add(j));
        Object.keys(selectedStats.additionalPointsPerJury || {}).forEach((j) => set.add(j));

        return Array.from(set);
    }, [selectedStats]);

    const criteriaGroups = useMemo(() => {
        if (!selectedStats) return [];

        return selectedStats.categories.map((cat, categoryIndex) => ({
            categoryId: cat.id,
            categoryTitle: cat.title,
            weight: cat.weight,
            order: categoryIndex,
            criteria: (cat.criteria || []).map((c, criteriaIndex) => ({
                id: c.id,
                text: c.text,
                order: criteriaIndex,
            })),
        }));
    }, [selectedStats]);

    const criteriaList = useMemo(() => {
        return criteriaGroups.flatMap((group) => group.criteria.map((item) => item.text));
    }, [criteriaGroups]);

    const getScore = useCallback(
        (jury: string, criteria: string) =>
            selectedStats?.pointsPerJury?.[jury]?.[criteria]?.points ?? 0,
        [selectedStats],
    );

    const getComment = useCallback(
        (jury: string, criteria: string) =>
            selectedStats?.pointsPerJury?.[jury]?.[criteria]?.comment ?? "",
        [selectedStats],
    );

    const bonusRows = useMemo<BonusRow[]>(() => {
        if (!selectedStats) return [];

        return Object.entries(selectedStats.additionalPointsPerJury || {}).flatMap(
            ([jury, bonuses]) =>
                (bonuses || []).map((b, index) => ({
                    id: `${jury}-${index}`,
                    jury,
                    points: b.points ?? 0,
                    comment: b.comment ?? "",
                })),
        );
    }, [selectedStats]);

    // weighted final total:
    // for each category -> average of criteria scores per jury -> multiplied by category weight
    // then averaged across juries, then summed across categories
    const grandTotal = useMemo(() => {
        if (!selectedStats) return 0;

        let weightedTotal = 0;

        criteriaGroups.forEach((group) => {
            const juryCategoryScores = juryList.map((jury) => {
                const rawScores = group.criteria.map((c) => getScore(jury, c.text));
                const categoryRawAverage = average(rawScores);
                return categoryRawAverage * group.weight;
            });

            weightedTotal += average(juryCategoryScores);
        });

        const bonusTotal = bonusRows.reduce((sum, row) => sum + row.points, 0);

        return weightedTotal + bonusTotal;
    }, [bonusRows, criteriaGroups, getScore, juryList, selectedStats]);

    const pivotRows = useMemo<PivotRow[]>(() => {
        if (!selectedStats) return [];

        const rows: PivotRow[] = [];

        criteriaGroups.forEach((group) => {
            const categoryValues: Record<string, number> = {};

            juryList.forEach((jury) => {
                const values = group.criteria.map((c) => getScore(jury, c.text));
                categoryValues[jury] = average(values) * group.weight;
            });

            rows.push({
                id: `cat:${group.categoryId}`,
                type: "category",
                categoryId: group.categoryId,
                categoryTitle: group.categoryTitle,
                label: group.categoryTitle,
                depth: 0,
                average: average(Object.values(categoryValues)),
                juryValues: categoryValues,
                weight: group.weight,
            });

            group.criteria.forEach((c) => {
                const juryValues: Record<string, number> = {};
                const juryComments: Record<string, string> = {};

                juryList.forEach((jury) => {
                    juryValues[jury] = getScore(jury, c.text);
                    juryComments[jury] = getComment(jury, c.text);
                });

                rows.push({
                    id: `crit:${group.categoryId}:${c.id}`,
                    type: "criteria",
                    categoryId: group.categoryId,
                    categoryTitle: group.categoryTitle,
                    label: c.text,
                    depth: 1,
                    average: average(Object.values(juryValues)),
                    juryValues,
                    juryComments,
                    weight: group.weight,
                });
            });
        });

        return rows;
    }, [criteriaGroups, getComment, getScore, juryList, selectedStats]);

    return {
        addMissingModalOpen,
        setAddMissingModalOpen,

        advanceModalOpen,
        setAdvanceModalOpen,

        missingTeams,
        selectedMissingIds,
        setSelectedMissingIds,

        selectedAdvanceIds,
        setSelectedAdvanceIds,
        targetAdvanceRoundId,
        setTargetAdvanceRoundId,
        tournamentRounds,

        isTeamsLoading,

        handleOpenAddMissingModal,
        handleConfirmAddMissing,
        handleOpenAdvanceModal,
        handleConfirmAdvance,
        handleUnassignTeam,

        handleOpenStats,
        handleCloseStats,
        selectedStats,
        statsModalOpen,
        setStatsModalOpen,

        handleExportLeaderboard,
        isExporting,

        statsViewMode,
        setStatsViewMode,

        juryList,
        criteriaGroups,
        criteriaList,
        pivotRows,
        bonusRows,
        grandTotal,
        getComment,

        handleAssignAllTeams,
        handleUnassignAllTeams,
    };
};