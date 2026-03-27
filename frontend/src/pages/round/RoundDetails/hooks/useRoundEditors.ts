import {useCallback, useEffect, useMemo, useState} from "react";

import {roundService} from "../../../../services/impl/RoundService";
import {categoryService} from "../../../../services/impl/CategoryService";
import {teamService} from "../../../../services/impl/TeamService";
import {userService} from "../../../../services/impl/UserService";
import {criteriaService} from "../../../../services/impl/CriteriaService";
import {submissionService} from "../../../../services/impl/SubmissionService";

import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../entities/round/round.dto";
import type {CategoryRequestDto} from "../../../../entities/category/category.dto";
import type {StatisticResponseDto} from "../../../../entities/team/team.dto";
import type {UserResponseDto} from "../../../../entities/user/user.dto";

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
    fetchSubmissions: () => Promise<void>;
    currentJury: UserResponseDto[]; // Це журі, вже призначені на раунд
};

export const useRoundEditors = ({ id, roundData, setRoundData, fetchCategories, fetchJury, fetchSubmissions, currentJury }: Params) => {

    const [autoAssignModalOpen, setAutoAssignModalOpen] = useState(false);
    const [kValue, setKValue] = useState<number>(3);
    const [submissionJuryModalOpen, setSubmissionJuryModalOpen] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

    // --- States for Modals ---
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [juryModalOpen, setJuryModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);

    // --- States for Jury Search ---
    const [availableJuries, setAvailableJuries] = useState<UserResponseDto[]>([]);
    const [selectedJuryToAssign, setSelectedJuryToAssign] = useState<UserResponseDto | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // --- States for Forms & Stats ---
    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as RoundUpdateRequestDto);
    const [newCategoryData, setNewCategoryData] = useState({ title: "", weight: 0.1 });
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [newCriteriaText, setNewCriteriaText] = useState("");

    // --- Logic: Search Debounce (ТІЛЬКИ для додавання журі в раунд) ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            // Ми робимо запит до сервера ТІЛЬКИ якщо відкрита модалка додавання до РАУНДУ
            if (!juryModalOpen) return;

            setIsSearching(true);
            try {
                const response = await userService.getJuries({
                    query: inputValue,
                    page: 0,
                    size: 20
                });

                // Фільтруємо тих, хто вже ВЖЕ є в раунді (щоб не додавати двічі)
                const filtered = (response.content || []).filter(
                    (user) => !currentJury.some((j) => j.id === user.id)
                );

                setAvailableJuries(filtered);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, juryModalOpen, currentJury]);

    // --- НОВЕ: Локальна фільтрація журі ТІЛЬКИ з поточного раунду для сабмішенів ---
    const availableJuriesForSubmission = useMemo(() => {
        if (!inputValue.trim()) return currentJury; // Якщо пошук пустий - показуємо всіх журі раунду

        const lowerQ = inputValue.toLowerCase();
        return currentJury.filter(j =>
            j.fullName.toLowerCase().includes(lowerQ) ||
            j.email.toLowerCase().includes(lowerQ)
        );
    }, [currentJury, inputValue]);

    // ... (РЕШТА ФУНКЦІЙ БЕЗ ЗМІН) ...
    const handleAutoAssignJuries = useCallback(async () => {
        if (!id) return;
        try {
            await roundService.autoAssignJuries(Number(id), kValue);
            setAutoAssignModalOpen(false);
            await fetchSubmissions();
            alert("Juries auto-assigned successfully!");
        } catch (error) {
            console.error("Error auto-assigning juries:", error);
        }
    }, [id, kValue, fetchSubmissions]);

    const handleOpenSubmissionJuryModal = useCallback((submissionId: number) => {
        setSelectedSubmissionId(submissionId);
        setInputValue("");
        setSubmissionJuryModalOpen(true);
    }, []);

    const handleAssignJuryToSubmission = useCallback(async (callback?: () => void) => {
        if (!selectedSubmissionId || !selectedJuryToAssign) return;
        try {
            await submissionService.assignJury(selectedSubmissionId, selectedJuryToAssign.id);
            setSubmissionJuryModalOpen(false);
            setSelectedJuryToAssign(null);

            // Викликаємо колбек, щоб SubmissionItem перевантажив своїх журі
            if (callback) callback();
            // Або якщо ми не передаємо колбек сюди, то просто fetchSubmissions,
            // але краще оновлювати конкретну картку.
        } catch (error) {
            console.error("Error assigning jury:", error);
        }
    }, [selectedSubmissionId, selectedJuryToAssign]);

    const handleRemoveJuryFromSubmission = useCallback(async (submissionId: number, juryId: number) => {
        try {
            await submissionService.removeJury(submissionId, juryId);
        } catch (error) {
            console.error("Error removing jury:", error);
        }
    }, []);

    // --- Handlers: Round Info ---
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

    // --- Handlers: Categories & Criteria ---
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

    const handleDeleteCategory = useCallback(async (categoryId: number) => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await categoryService.deleteCategory(Number(id), categoryId);
            await fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    }, [id, fetchCategories]);

    const handleAddCriteria = useCallback(async () => {
        if (!selectedCategoryId || !newCriteriaText.trim()) return;
        try {
            await criteriaService.createCriteria(selectedCategoryId, { text: newCriteriaText });
            setCriteriaModalOpen(false);
            setNewCriteriaText("");
            setSelectedCategoryId(null);
            await fetchCategories();
        } catch (error) {
            console.error("Error creating criteria:", error);
        }
    }, [selectedCategoryId, newCriteriaText, fetchCategories]);

    const handleDeleteCriteria = useCallback(async (categoryId: number, criteriaId: number) => {
        if (!window.confirm("Are you sure you want to delete this criteria?")) return;
        try {
            await criteriaService.deleteCriteria(categoryId, criteriaId);
            await fetchCategories();
        } catch (error) {
            console.error("Error deleting criteria:", error);
        }
    }, [fetchCategories]);

    // --- Handlers: Jury Management ---
    const handleOpenJuryModal = useCallback(() => {
        setInputValue("");
        setJuryModalOpen(true);
    }, []);

    const handleAssignJury = useCallback(async () => {
        if (!id || !selectedJuryToAssign) return;
        try {
            await roundService.setJuryToRound(Number(id), selectedJuryToAssign.id);
            setJuryModalOpen(false);
            setSelectedJuryToAssign(null);
            await fetchJury();
        } catch (error) {
            console.error("Error assigning jury:", error);
        }
    }, [fetchJury, id, selectedJuryToAssign]);

    const handleRemoveJury = useCallback(async (juryId: number) => {
        if (!id) return;
        try {
            await roundService.removeJuryFromRound(Number(id), juryId);
            await fetchJury();
        } catch (error) {
            console.error("Error removing jury:", error);
        }
    }, [fetchJury, id]);

    // --- Handlers: Stats ---
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
        isEditingInfo, setIsEditingInfo,
        categoryModalOpen, setCategoryModalOpen,
        juryModalOpen, setJuryModalOpen,
        statsModalOpen, setStatsModalOpen,
        criteriaModalOpen, setCriteriaModalOpen,

        availableJuries,
        availableJuriesForSubmission, // НОВИЙ СТЕЙТ ДОДАННО ТУТ
        selectedJuryToAssign, setSelectedJuryToAssign,
        inputValue, setInputValue,
        isSearching,

        selectedStats,
        statsViewMode, setStatsViewMode,
        editFormData, setEditFormData,
        newCategoryData, setNewCategoryData,
        selectedCategoryId, setSelectedCategoryId,
        newCriteriaText, setNewCriteriaText,
        aggregatedCriteria,
        juryList,
        criteriaList,

        handleSaveUpdate,
        handleStatusChange,
        cancelEditing,
        handleAddCategory,
        handleDeleteCategory,
        handleAddCriteria,
        handleDeleteCriteria,
        handleOpenJuryModal,
        handleAssignJury,
        handleRemoveJury,
        handleOpenStats,

        autoAssignModalOpen, setAutoAssignModalOpen,
        kValue, setKValue,
        submissionJuryModalOpen, setSubmissionJuryModalOpen,
        selectedSubmissionId, setSelectedSubmissionId,
        handleAutoAssignJuries,
        handleOpenSubmissionJuryModal,
        handleAssignJuryToSubmission,
        handleRemoveJuryFromSubmission,
    };
};