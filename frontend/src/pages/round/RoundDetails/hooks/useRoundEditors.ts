import {useCallback, useEffect, useMemo, useState} from "react";

import {roundService} from "../../../../services/impl/RoundService";
import {categoryService} from "../../../../services/impl/CategoryService";
import {teamService} from "../../../../services/impl/TeamService";
import {userService} from "../../../../services/impl/UserService";
import {criteriaService} from "../../../../services/impl/CriteriaService";
import {submissionService} from "../../../../services/impl/SubmissionService";

import type {
    RoundFullResponseDto,
    RoundListResponseDto,
    RoundStatus,
    RoundUpdateRequestDto
} from "../../../../entities/round/round.dto";
import type {CategoryRequestDto} from "../../../../entities/category/category.dto";
import type {StatisticResponseDto, TeamListResponseDto} from "../../../../entities/team/team.dto";
import type {UserResponseDto} from "../../../../entities/user/user.dto";

import type {
    TaskPriority,
    TaskStatus,
    TaskType,
    TeamTaskRequestDto,
    TeamTaskResponseDto
} from "../../../../entities/teamTask/teamtask.dto";
import {teamTaskService} from "../../../../services/impl/TeamTaskService.ts";

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
    fetchTasks: () => Promise<void>;
};

type ConfirmDialogConfig = {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmColor?: "primary" | "error" | "secondary";
    isLoading?: boolean;
};

export const useRoundEditors = ({ id, roundData, setRoundData, fetchCategories, fetchJury, fetchSubmissions, fetchTasks }: Params) => {
    const roundId = Number(id);
    const [errors, setErrors] = useState<string[]>([]);
    const clearErrors = useCallback(() => setErrors([]), []);

    // --- Обгортка для автоматичного очищення помилок при закритті модалок ---
    const withErrorClear = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        return (value: boolean | ((prev: boolean) => boolean)) => {
            if (value === false) clearErrors(); // Очищаємо помилки, якщо вікно закривається
            setter(value);
        };
    }, [clearErrors]);

    // --- Pagination States ---
    const [juryPage, setJuryPage] = useState(1);
    const [juryTotalPages, setJuryTotalPages] = useState(1);
    const [subJuryPage, setSubJuryPage] = useState(1);
    const [subJuryTotalPages, setSubJuryTotalPages] = useState(1);

    // --- Modal States ---
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [juryModalOpen, setJuryModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
    const [autoAssignModalOpen, setAutoAssignModalOpen] = useState(false);
    const [submissionJuryModalOpen, setSubmissionJuryModalOpen] = useState(false);
    const [addMissingModalOpen, setAddMissingModalOpen] = useState(false);
    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);

    // --- Search & Selection States ---
    const [availableJuries, setAvailableJuries] = useState<UserResponseDto[]>([]);
    const [availableSubmissionJuries, setAvailableSubmissionJuries] = useState<UserResponseDto[]>([]);
    const [selectedJuryToAssign, setSelectedJuryToAssign] = useState<UserResponseDto | null>(null);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isSubJurySearching, setIsSubJurySearching] = useState(false);

    // --- Data States ---
    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as RoundUpdateRequestDto);
    const [newCategoryData, setNewCategoryData] = useState({ title: "", weight: 0.1 });
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [newCriteriaText, setNewCriteriaText] = useState("");
    const [missingTeams, setMissingTeams] = useState<TeamListResponseDto[]>([]);
    const [selectedMissingIds, setSelectedMissingIds] = useState<number[]>([]);
    const [targetAdvanceRoundId, setTargetAdvanceRoundId] = useState<number | null>(null);
    const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<number[]>([]);
    const [tournamentRounds, setTournamentRounds] = useState<RoundListResponseDto[]>([]);

    const [kValue, setKValue] = useState<number>(3);
    const [isTeamsLoading, setIsTeamsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TeamTaskResponseDto | null>(null);
    const [isTaskLoading, setIsTaskLoading] = useState(false);
    const [taskFormData, setTaskFormData] = useState<TeamTaskRequestDto>({
        title: "",
        description: "",
        status: "TODO",
        type: "FEATURE",
        priority: "MEDIUM"
    });

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
        confirmColor: "primary",
        isLoading: false
    });

    // --- Confirm Dialog Helpers ---
    const closeConfirm = useCallback(() => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        clearErrors(); // Очищаємо помилки при закритті діалогу підтвердження
    }, [clearErrors]);

    const triggerConfirm = useCallback((config: Omit<ConfirmDialogConfig, 'open'>) => {
        setConfirmDialog({ ...config, open: true });
    }, []);

    // --- Helper to handle errors ---
    const handleError = useCallback((error: any, defaultMessage: string) => {
        const messages = error.response?.data?.messages;
        setErrors(Array.isArray(messages) ? messages : [defaultMessage]);
    }, []);

    // --- Export Handler ---
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

    // --- Search Handlers ---
    const handleSearchChange = useCallback((value: string) => {
        setInputValue(value);
        setJuryPage(1);
        setSubJuryPage(1);
    }, []);

    // Global Jury Search
    useEffect(() => {
        if (!juryModalOpen) return;
        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await userService.getJuries({ query: inputValue, page: juryPage - 1, size: 10 });
                setAvailableJuries(response.content || []);
                setJuryTotalPages(response.totalPages === 0 ? 1 : response.totalPages);
            } catch (error: any) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, juryPage, juryModalOpen]);

    // Submission Specific Jury Search
    useEffect(() => {
        if (!submissionJuryModalOpen || !selectedSubmissionId) return;
        const delayDebounceFn = setTimeout(async () => {
            setIsSubJurySearching(true);
            try {
                const response = await submissionService.getAvailableJuries(selectedSubmissionId, {
                    query: inputValue,
                    page: subJuryPage - 1,
                    size: 10
                });
                setAvailableSubmissionJuries(response.content || []);
                setSubJuryTotalPages(response.totalPages === 0 ? 1 : response.totalPages);
            } catch (error: any) {
                console.error("Error fetching submission juries:", error);
            } finally {
                setIsSubJurySearching(false);
            }
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, subJuryPage, submissionJuryModalOpen, selectedSubmissionId]);

    // --- Modal Openers ---
    const handleOpenJuryModal = useCallback(() => {
        clearErrors();
        setInputValue(""); setJuryPage(1); setSelectedJuryToAssign(null); setJuryModalOpen(true);
    }, [clearErrors]);

    const handleOpenSubmissionJuryModal = useCallback((submissionId: number) => {
        clearErrors();
        setSelectedSubmissionId(submissionId); setInputValue(""); setSubJuryPage(1);
        setSelectedJuryToAssign(null); setSubmissionJuryModalOpen(true);
    }, [clearErrors]);

    const handleOpenAddMissingModal = useCallback(async () => {
        if (!roundId) return;
        clearErrors();
        setIsTeamsLoading(true);
        setAddMissingModalOpen(true);
        try {
            const response = await roundService.getTeamsNotInRound(roundId, { page: 0, size: 500 });
            setMissingTeams(response.content || []);
            setSelectedMissingIds([]);
        } catch (error: any) {
            handleError(error, "Помилка завантаження відсутніх команд");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [roundId, clearErrors, handleError]);

    const handleOpenAdvanceModal = useCallback(async () => {
        clearErrors();
        setTargetAdvanceRoundId(null);
        setAdvanceModalOpen(true);
        try {
            const rounds = await roundService.getRoundsByRound(roundId, {page: 0, size: 100, status: 'DRAFT'});
            setTournamentRounds(rounds.content);
        } catch (error: any) {
            handleError(error, "Помилка завантаження раундів");
        }
    }, [roundId, clearErrors, handleError]);

    // --- Actions ---
    const handleConfirmAddMissing = useCallback(async () => {
        if (!roundId || selectedMissingIds.length === 0) return;
        clearErrors();
        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(roundId, selectedMissingIds);
            setAddMissingModalOpen(false);
            await fetchSubmissions();
            triggerConfirm({ title: "Success", description: "Teams assigned successfully!", onConfirm: closeConfirm });
        } catch (error: any) {
            handleError(error, "Помилка призначення команд");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [roundId, selectedMissingIds, fetchSubmissions, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleConfirmAdvance = useCallback(async () => {
        if (!targetAdvanceRoundId || selectedAdvanceIds.length === 0) return;
        clearErrors();
        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(targetAdvanceRoundId, selectedAdvanceIds);
            setAdvanceModalOpen(false);
            triggerConfirm({ title: "Success", description: "Teams successfully advanced!", onConfirm: closeConfirm });
        } catch (error: any) {
            handleError(error, "Помилка переведення команд");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [targetAdvanceRoundId, selectedAdvanceIds, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleUnassignTeam = useCallback((teamId: number) => {
        triggerConfirm({
            title: "Remove Team",
            description: "Remove this team from the current round?",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await roundService.unassignTeams(roundId, [teamId]);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (error: any) {
                    handleError(error, "Помилка видалення команди");
                }
            }
        });
    }, [roundId, fetchSubmissions, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleAssignJury = useCallback(async () => {
        if (!roundId || !selectedJuryToAssign) return;
        clearErrors();
        try {
            await roundService.setJuryToRound(roundId, selectedJuryToAssign.id);
            setJuryModalOpen(false);
            setSelectedJuryToAssign(null);
            await fetchJury();
        } catch (error: any) {
            handleError(error, "Помилка призначення журі");
        }
    }, [fetchJury, roundId, selectedJuryToAssign, clearErrors, handleError]);

    const handleAssignJuryToSubmission = useCallback(async (callback?: () => void) => {
        if (!selectedSubmissionId || !selectedJuryToAssign) return;
        clearErrors();
        try {
            await submissionService.assignJury(selectedSubmissionId, selectedJuryToAssign.id);
            setSubmissionJuryModalOpen(false);
            setSelectedJuryToAssign(null);
            if (callback) callback();
        } catch (error: any) {
            handleError(error, "Помилка призначення журі до сабмішну");
        }
    }, [selectedSubmissionId, selectedJuryToAssign, clearErrors, handleError]);

    const handleRemoveJuryFromSubmission = useCallback((submissionId: number, juryId: number) => {
        triggerConfirm({
            title: "Remove Jury",
            description: "This jury member will no longer grade this submission. Continue?",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await submissionService.removeJury(submissionId, juryId);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (error: any) {
                    handleError(error, "Помилка видалення журі з сабмішну");
                }
            }
        });
    }, [fetchSubmissions, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleAutoAssignJuries = useCallback(async () => {
        if (!roundId) return;
        clearErrors();
        try {
            await roundService.autoAssignJuries(roundId, kValue);
            setAutoAssignModalOpen(false);
            await fetchSubmissions();
            triggerConfirm({ title: "Complete", description: `Juries assigned (k=${kValue}).`, onConfirm: closeConfirm });
        } catch (error: any) {
            handleError(error, "Помилка автоматичного призначення журі");
        }
    }, [roundId, kValue, fetchSubmissions, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleSaveUpdate = useCallback(async () => {
        if (!roundId || !roundData) return;
        clearErrors();
        try {
            const payload = {
                ...editFormData,
                startDate: formatToLocalDateTime(editFormData.startDate),
                endDate: formatToLocalDateTime(editFormData.endDate),
            };
            const updated = await roundService.updateRound(roundId, payload as RoundUpdateRequestDto);
            setRoundData(updated);
            setIsEditingInfo(false); // will automatically clear errors due to wrapper
        } catch (error: any) {
            handleError(error, "Помилка оновлення раунду");
        }
    }, [editFormData, roundId, roundData, setRoundData, clearErrors, handleError]);

    const handleStatusChange = useCallback((newStatus: RoundStatus) => {
        const now = new Date();
        let sDate = editFormData.startDate ? new Date(editFormData.startDate) : new Date();
        let eDate = editFormData.endDate ? new Date(editFormData.endDate) : new Date(now.getTime() + 86400000);

        if (newStatus === "DRAFT" && sDate <= now) {
            sDate = new Date(now.getTime() + 86400000);
            eDate = new Date(sDate.getTime() + 86400000);
        } else if (newStatus === "ACTIVE") {
            if (sDate > now) sDate = new Date(now.getTime() - 60000);
            if (eDate <= now) eDate = new Date(now.getTime() + 86400000);
        } else if (["SUBMISSION_CLOSED", "EVALUATED"].includes(newStatus)) {
            if (eDate > now) eDate = new Date(now.getTime() - 60000);
            if (sDate >= eDate) sDate = new Date(eDate.getTime() - 86400000);
        }

        setEditFormData(prev => ({
            ...prev,
            status: newStatus,
            startDate: toDateTimeLocal(sDate),
            endDate: toDateTimeLocal(eDate)
        }));
    }, [editFormData]);

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

    const handleAddCategory = useCallback(async () => {
        if (!roundId) return;
        clearErrors();
        try {
            await categoryService.createCategory(roundId, newCategoryData as CategoryRequestDto);
            setCategoryModalOpen(false);
            setNewCategoryData({ title: "", weight: 0.1 });
            await fetchCategories();
        } catch (error: any) {
            handleError(error, "Помилка створення категорії");
        }
    }, [fetchCategories, roundId, newCategoryData, clearErrors, handleError]);

    const handleDeleteCategory = useCallback((categoryId: number) => {
        triggerConfirm({
            title: "Delete Category",
            description: "This will remove all its criteria. Continue?",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await categoryService.deleteCategory(roundId, categoryId);
                    await fetchCategories();
                    closeConfirm();
                } catch (error: any) {
                    handleError(error, "Помилка видалення категорії");
                }
            }
        });
    }, [roundId, fetchCategories, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleAddCriteria = useCallback(async () => {
        if (!selectedCategoryId || !newCriteriaText.trim()) return;
        clearErrors();
        try {
            await criteriaService.createCriteria(selectedCategoryId, { text: newCriteriaText });
            setCriteriaModalOpen(false);
            setNewCriteriaText("");
            setSelectedCategoryId(null);
            await fetchCategories();
        } catch (error: any) {
            handleError(error, "Помилка створення критерія");
        }
    }, [selectedCategoryId, newCriteriaText, fetchCategories, clearErrors, handleError]);

    const handleDeleteCriteria = useCallback((categoryId: number, criteriaId: number) => {
        triggerConfirm({
            title: "Delete Criteria",
            description: "Are you sure?",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await criteriaService.deleteCriteria(categoryId, criteriaId);
                    await fetchCategories();
                    closeConfirm();
                } catch (error: any) {
                    handleError(error, "Помилка видалення критерія");
                }
            }
        });
    }, [fetchCategories, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleRemoveJury = useCallback((juryId: number) => {
        triggerConfirm({
            title: "Remove Jury",
            description: "Remove this jury from the round?",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await roundService.removeJuryFromRound(roundId, juryId);
                    await fetchJury();
                    closeConfirm();
                } catch (error: any) {
                    handleError(error, "Помилка видалення журі");
                }
            }
        });
    }, [fetchJury, roundId, closeConfirm, triggerConfirm, clearErrors, handleError]);

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

    const handleDeleteRound = useCallback(() => {
        triggerConfirm({
            title: "Delete Round",
            description: "This action cannot be undone. Continue?",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await roundService.deleteRound(roundId);
                    window.location.href = `/home`;
                } catch (error: any) {
                    handleError(error, "Помилка видалення раунду");
                }
            }
        });
    }, [roundId, triggerConfirm, clearErrors, handleError]);

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

    const handleOpenTaskModal = useCallback((task?: TeamTaskResponseDto) => {
        clearErrors();
        if (task) {
            setSelectedTask(task);
            setTaskFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                type: task.type,
                priority: task.priority
            });
        } else {
            setSelectedTask(null);
            setTaskFormData({ title: "", description: "", status: "TODO", type: "FEATURE", priority: "MEDIUM" });
        }
        setTaskModalOpen(true);
    }, [clearErrors]);

    const handleSaveTask = useCallback(async () => {
        clearErrors();
        setIsTaskLoading(true);
        try {
            if (selectedTask) {
                await teamTaskService.updateTask(selectedTask.id, taskFormData);
            } else {
                await teamTaskService.createTask(Number(id), taskFormData);
            }
            setTaskModalOpen(false);
            await fetchTasks();
        } catch (error: any) {
            handleError(error, "Помилка збереження завдання");
        } finally {
            setIsTaskLoading(false);
        }
    }, [id, selectedTask, taskFormData, fetchTasks, handleError, clearErrors]);

    const handleDeleteTask = useCallback((taskId: number) => {
        triggerConfirm({
            title: "Видалити завдання?",
            description: "Цю дію неможливо скасувати.",
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await teamTaskService.deleteTask(taskId);
                    await fetchTasks();
                    closeConfirm();
                } catch (error: any) {
                    handleError(error, "Помилка видалення завдання");
                }
            }
        });
    }, [fetchTasks, closeConfirm, triggerConfirm, clearErrors, handleError]);

    const handleUpdateTaskMeta = useCallback(async (taskId: number, meta: { status?: TaskStatus; priority?: TaskPriority; type?: TaskType }) => {
        try {
            await teamTaskService.updateTaskMeta(taskId, meta);
            await fetchTasks();
        } catch (error: any) {
            handleError(error, "Помилка оновлення статусу");
        }
    }, [fetchTasks, handleError]);

    const handleAssignMe = useCallback(async (taskId: number, currentUserId: number) => {
        try {
            await teamTaskService.updateAssignee(taskId, currentUserId);
            await fetchTasks();
        } catch (error: any) {
            handleError(error, "Помилка призначення виконавця");
        }
    }, [fetchTasks, handleError]);

    return {
        // Errors
        errors, clearErrors,

        // Wrapped Modals (автоматично очищають помилки при закритті)
        isEditingInfo, setIsEditingInfo: withErrorClear(setIsEditingInfo),
        categoryModalOpen, setCategoryModalOpen: withErrorClear(setCategoryModalOpen),
        juryModalOpen, setJuryModalOpen: withErrorClear(setJuryModalOpen),
        statsModalOpen, setStatsModalOpen: withErrorClear(setStatsModalOpen),
        criteriaModalOpen, setCriteriaModalOpen: withErrorClear(setCriteriaModalOpen),
        autoAssignModalOpen, setAutoAssignModalOpen: withErrorClear(setAutoAssignModalOpen),
        submissionJuryModalOpen, setSubmissionJuryModalOpen: withErrorClear(setSubmissionJuryModalOpen),
        addMissingModalOpen, setAddMissingModalOpen: withErrorClear(setAddMissingModalOpen),
        advanceModalOpen, setAdvanceModalOpen: withErrorClear(setAdvanceModalOpen),

        // Teams
        missingTeams, selectedMissingIds, setSelectedMissingIds, tournamentRounds,
        targetAdvanceRoundId, setTargetAdvanceRoundId, selectedAdvanceIds, setSelectedAdvanceIds,
        isTeamsLoading, handleOpenAddMissingModal, handleConfirmAddMissing,
        handleOpenAdvanceModal, handleConfirmAdvance, handleUnassignTeam,

        // Jury
        availableJuries, availableSubmissionJuries, selectedJuryToAssign, setSelectedJuryToAssign,
        inputValue, setInputValue, isSearching, isSubJurySearching, juryPage, setJuryPage,
        juryTotalPages, subJuryPage, setSubJuryPage, subJuryTotalPages,
        handleOpenJuryModal, handleOpenSubmissionJuryModal, handleAssignJury, handleRemoveJury,
        handleAssignJuryToSubmission, handleRemoveJuryFromSubmission, handleAutoAssignJuries,
        handleSearchChange, setKValue, kValue,

        // Forms & Stats
        selectedStats, statsViewMode, setStatsViewMode, editFormData, setEditFormData,
        newCategoryData, setNewCategoryData, selectedCategoryId, setSelectedCategoryId,
        newCriteriaText, setNewCriteriaText, aggregatedCriteria,
        juryList: selectedStats?.pointsPerJury ? Object.keys(selectedStats.pointsPerJury) : [],
        criteriaList: Object.keys(aggregatedCriteria),

        // Handlers
        handleSaveUpdate, handleStatusChange, cancelEditing: () => { resetEditForm(); clearErrors(); setIsEditingInfo(false); },
        handleAddCategory, handleDeleteCategory, handleAddCriteria, handleDeleteCriteria,
        handleOpenStats, handleDeleteRound, handleExportLeaderboard, isExporting,
        confirmDialog, closeConfirm,

        // Task Exports
        taskModalOpen, setTaskModalOpen: withErrorClear(setTaskModalOpen),
        taskFormData, setTaskFormData,
        isTaskLoading, selectedTask,
        handleOpenTaskModal, handleSaveTask, handleDeleteTask,
        handleUpdateTaskMeta, handleAssignMe,
    };
};