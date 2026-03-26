import {useCallback, useMemo, useState} from "react";

import {roundService} from "../../../../services/impl/RoundService";
import {categoryService} from "../../../../services/impl/CategoryService";
import {teamService} from "../../../../services/impl/TeamService";
import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../entities/round/round.dto";
import type {CategoryRequestDto} from "../../../../entities/category/category.dto";
import type {StatisticResponseDto} from "../../../../entities/team/team.dto";

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

const toDateTimeLocal = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

type Params = {
    id?: string;
    roundData: RoundFullResponseDto | null;
    setRoundData: React.Dispatch<React.SetStateAction<RoundFullResponseDto | null>>;
    fetchCategories: () => Promise<void>;
    fetchJury: () => Promise<void>;
};

export const useRoundEditors = ({ id, roundData, setRoundData, fetchCategories, fetchJury }: Params) => {
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [juryModalOpen, setJuryModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");

    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as RoundUpdateRequestDto);
    const [newCategoryData, setNewCategoryData] = useState({ title: "", weight: 0.1 });
    const [juryAssignId, setJuryAssignId] = useState("");

    const resetEditForm = useCallback(() => {
        if (!roundData) return;
        setEditFormData({
            name: roundData.name,
            startDate: roundData.startDate?.substring(0, 16) || "",
            endDate: roundData.endDate?.substring(0, 16) || "",
            countOfWinners: roundData.countOfWinners,
            requirements: roundData.requirements,
            task: roundData.task,
            status: roundData.status,
        } as RoundUpdateRequestDto);
    }, [roundData]);

    const handleSaveUpdate = useCallback(async () => {
        if (!id || !roundData) return;
        try {
            const payload = {
                ...editFormData,
                startDate: formatToLocalDateTime(editFormData.startDate),
                endDate: formatToLocalDateTime(editFormData.endDate),
            };
            const updated = await roundService.updateRound(Number(id), payload as RoundUpdateRequestDto);
            setRoundData(updated);
            setIsEditingInfo(false);
        } catch (error) {
            console.error("Update round error:", error);
        }
    }, [editFormData, id, roundData, setRoundData]);

    const handleAddCategory = useCallback(async () => {
        if (!id) return;
        try {
            await categoryService.createCategory(Number(id), newCategoryData as CategoryRequestDto);
            setCategoryModalOpen(false);
            setNewCategoryData({ title: "", weight: 0.1 });
            await fetchCategories();
        } catch (error) {
            console.error("Error creating category:", error);
        }
    }, [fetchCategories, id, newCategoryData]);

    const handleAssignJury = useCallback(async () => {
        if (!id || !juryAssignId) return;
        try {
            await roundService.setJuryToRound(Number(id), Number(juryAssignId));
            setJuryModalOpen(false);
            setJuryAssignId("");
            await fetchJury();
        } catch (error) {
            console.error("Error assigning jury:", error);
        }
    }, [fetchJury, id, juryAssignId]);

    const handleRemoveJury = useCallback(async (juryId: number) => {
        if (!id) return;
        try {
            await roundService.removeJuryFromRound(Number(id), juryId);
            await fetchJury();
        } catch (error) {
            console.error("Error removing jury:", error);
        }
    }, [fetchJury, id]);

    const handleOpenStats = useCallback(async (teamId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;
        try {
            const stats = await teamService.getTeamStats(teamId, Number(id));
            setSelectedStats(stats);
            setStatsModalOpen(true);
        } catch (error) {
            console.error("Error fetching team stats:", error);
        }
    }, [id]);

    const handleStatusChange = useCallback((newStatus: RoundStatus) => {
        const now = new Date();
        let newStartDate = editFormData.startDate ? new Date(editFormData.startDate) : new Date();
        let newEndDate = editFormData.endDate ? new Date(editFormData.endDate) : new Date(now.getTime() + 86400000);

        if (newStatus === "DRAFT") {
            if (newStartDate <= now) {
                newStartDate = new Date(now.getTime() + 86400000);
                newEndDate = new Date(newStartDate.getTime() + 86400000);
            }
        } else if (newStatus === "ACTIVE") {
            if (newStartDate > now) newStartDate = new Date(now.getTime() - 60000);
            if (newEndDate <= now) newEndDate = new Date(now.getTime() + 86400000);
        } else if (newStatus === "SUBMISSION_CLOSED" || newStatus === "EVALUATED") {
            if (newEndDate > now) newEndDate = new Date(now.getTime() - 60000);
            if (newStartDate >= newEndDate) newStartDate = new Date(newEndDate.getTime() - 86400000);
        }

        setEditFormData(prev => ({
            ...prev,
            status: newStatus,
            startDate: toDateTimeLocal(newStartDate),
            endDate: toDateTimeLocal(newEndDate),
        }));
    }, [editFormData.endDate, editFormData.startDate]);

    const cancelEditing = useCallback(() => {
        resetEditForm();
        setIsEditingInfo(false);
    }, [resetEditForm]);

    const aggregatedCriteria = useMemo(() => {
        if (!selectedStats || !selectedStats.pointsPerJury) return {};
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

    const juryList = selectedStats?.pointsPerJury ? Object.keys(selectedStats.pointsPerJury) : [];
    const criteriaList = Object.keys(aggregatedCriteria);

    return {
        isEditingInfo,
        setIsEditingInfo,
        categoryModalOpen,
        setCategoryModalOpen,
        juryModalOpen,
        setJuryModalOpen,
        statsModalOpen,
        setStatsModalOpen,
        selectedStats,
        statsViewMode,
        setStatsViewMode,
        editFormData,
        setEditFormData,
        newCategoryData,
        setNewCategoryData,
        juryAssignId,
        setJuryAssignId,
        handleSaveUpdate,
        handleAddCategory,
        handleAssignJury,
        handleRemoveJury,
        handleOpenStats,
        handleStatusChange,
        aggregatedCriteria,
        juryList,
        criteriaList,
        cancelEditing,
    };
};