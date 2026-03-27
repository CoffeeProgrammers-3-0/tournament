import {useCallback, useEffect, useMemo, useState} from "react";

import {roundService} from "../../../../services/impl/RoundService";
import {categoryService} from "../../../../services/impl/CategoryService";
import {teamService} from "../../../../services/impl/TeamService";
import {userService} from "../../../../services/impl/UserService";
import {criteriaService} from "../../../../services/impl/CriteriaService";
import {submissionService} from "../../../../services/impl/SubmissionService";

import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../entities/round/round.dto";
import type {CategoryRequestDto} from "../../../../entities/category/category.dto";
import type {
    StatisticResponseDto,
    TeamLeaderboardResponseDto,
    TeamListResponseDto
} from "../../../../entities/team/team.dto";
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
    currentJury: UserResponseDto[];
};

export const useRoundEditors = ({ id, roundData, setRoundData, fetchCategories, fetchJury, fetchSubmissions, currentJury }: Params) => {

    // --- States for Modals ---
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [juryModalOpen, setJuryModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);

    const [autoAssignModalOpen, setAutoAssignModalOpen] = useState(false);
    const [kValue, setKValue] = useState<number>(3);
    const [submissionJuryModalOpen, setSubmissionJuryModalOpen] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

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

    // --- States for ADD MISSING TEAMS ---
    const [addMissingModalOpen, setAddMissingModalOpen] = useState(false);
    const [missingTeams, setMissingTeams] = useState<TeamListResponseDto[]>([]);
    const [selectedMissingIds, setSelectedMissingIds] = useState<number[]>([]);

    // --- States for ADVANCE TEAMS ---
    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
    const [targetAdvanceRoundId, setTargetAdvanceRoundId] = useState<number | null>(null);
    const [selectedAdvanceIds, setSelectedAdvanceIds] = useState<number[]>([]);
    const [tournamentRounds, setTournamentRounds] = useState<RoundFullResponseDto[]>([]);

    const [isTeamsLoading, setIsTeamsLoading] = useState(false);

    // --- Actions for ADD MISSING ---
    const handleOpenAddMissingModal = useCallback(async () => {
        if (!id) return;
        setIsTeamsLoading(true);
        setAddMissingModalOpen(true);
        try {
            const response = await roundService.getTeamsNotInRound(Number(id), { page: 0, size: 500 });
            setMissingTeams(response.content || []);
            setSelectedMissingIds([]);
        } catch (error) {
            console.error("Error fetching unassigned teams:", error);
        } finally {
            setIsTeamsLoading(false);
        }
    }, [id]);

    const handleConfirmAddMissing = useCallback(async () => {
        if (!id || selectedMissingIds.length === 0) return;
        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(Number(id), selectedMissingIds);
            setAddMissingModalOpen(false);
            setSelectedMissingIds([]);
            await fetchSubmissions();
        } catch (error) {
            alert("Failed to assign teams");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [id, selectedMissingIds, fetchSubmissions]);

    // --- Actions for ADVANCE TEAMS ---
    const handleOpenAdvanceModal = useCallback(async (currentLeaderboard: TeamLeaderboardResponseDto[], winnersCount: number) => {
        // Pre-select the top N winners
        const topTeamIds = currentLeaderboard.slice(0, winnersCount).map(t => t.id);
        setSelectedAdvanceIds(topTeamIds);
        setTargetAdvanceRoundId(null);
        setAdvanceModalOpen(true);

        // Fetch tournament rounds to populate the select dropdown (excluding current round)
        try {
            // Assuming you have a method to get rounds by tournament ID. Adjust if your service is different.
            const rounds = await roundService.getRoundsByRound(Number(roundData?.id), {page: 0, size: 100, status: 'DRAFT'});
            setTournamentRounds(rounds.content.filter(r => r.id !== Number(id)));
        } catch (error) {
            console.error("Failed to fetch tournament rounds", error);
        }
    }, [id, roundData]);

    const handleConfirmAdvance = useCallback(async () => {
        if (!targetAdvanceRoundId || selectedAdvanceIds.length === 0) return;
        setIsTeamsLoading(true);
        try {
            await roundService.assignTeams(targetAdvanceRoundId, selectedAdvanceIds);
            setAdvanceModalOpen(false);
            alert("Teams successfully advanced to the next round!");
        } catch (error) {
            alert("Failed to advance teams");
        } finally {
            setIsTeamsLoading(false);
        }
    }, [targetAdvanceRoundId, selectedAdvanceIds]);

    // --- Actions for UNASSIGN (Individual) ---
    const handleUnassignTeam = useCallback(async (teamId: number) => {
        if (!id || !window.confirm("Remove this team from the current round?")) return;
        try {
            await roundService.unassignTeams(Number(id), [teamId]);
            await fetchSubmissions();
        } catch (error) {
            console.error("Error unassigning team:", error);
        }
    }, [id, fetchSubmissions]);

    // --- Logic: Search Debounce (For Jury Modal) ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!juryModalOpen) return;
            setIsSearching(true);
            try {
                const response = await userService.getJuries({ query: inputValue, page: 0, size: 20 });
                const filtered = (response.content || []).filter((user) => !currentJury.some((j) => j.id === user.id));
                setAvailableJuries(filtered);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, juryModalOpen, currentJury]);

    const availableJuriesForSubmission = useMemo(() => {
        if (!inputValue.trim()) return currentJury;
        const lowerQ = inputValue.toLowerCase();
        return currentJury.filter(j => j.fullName.toLowerCase().includes(lowerQ) || j.email.toLowerCase().includes(lowerQ));
    }, [currentJury, inputValue]);

    // --- Remaining Handlers (Status, Jury, Categories, Criteria, Delete) ---
    // (Kept exactly as your previous code to ensure nothing breaks)

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
            if (callback) callback();
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

        setEditFormData(prev => ({ ...prev, status: newStatus, startDate: toDateTimeLocal(newStartDate), endDate: toDateTimeLocal(newEndDate) }));
    }, [editFormData.endDate, editFormData.startDate]);

    const cancelEditing = useCallback(() => {
        resetEditForm();
        setIsEditingInfo(false);
    }, [resetEditForm]);

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

    const handleDeleteRound = useCallback(async () => {
        if (!id || !roundData) return;
        if (!window.confirm("Are you sure you want to delete this round? This action cannot be undone.")) return;
        try {
            await roundService.deleteRound(Number(id));
            alert("Round deleted successfully");
            window.location.href = `/home`;
        } catch (error) {
            console.error("Error deleting round:", error);
            alert("Failed to delete round");
        }
    }, [id, roundData]);

    const juryList = selectedStats?.pointsPerJury ? Object.keys(selectedStats.pointsPerJury) : [];
    const criteriaList = Object.keys(aggregatedCriteria);

    return {
        // Core Modals & States
        isEditingInfo, setIsEditingInfo,
        categoryModalOpen, setCategoryModalOpen,
        juryModalOpen, setJuryModalOpen,
        statsModalOpen, setStatsModalOpen,
        criteriaModalOpen, setCriteriaModalOpen,

        // Team Management States
        addMissingModalOpen, setAddMissingModalOpen,
        missingTeams,
        selectedMissingIds, setSelectedMissingIds,
        advanceModalOpen, setAdvanceModalOpen,
        tournamentRounds,
        targetAdvanceRoundId, setTargetAdvanceRoundId,
        selectedAdvanceIds, setSelectedAdvanceIds,
        isTeamsLoading,

        // Team Management Handlers
        handleOpenAddMissingModal,
        handleConfirmAddMissing,
        handleOpenAdvanceModal,
        handleConfirmAdvance,
        handleUnassignTeam,

        // Jury States
        availableJuries,
        availableJuriesForSubmission,
        selectedJuryToAssign, setSelectedJuryToAssign,
        inputValue, setInputValue,
        isSearching,

        // Form & Stats States
        selectedStats,
        statsViewMode, setStatsViewMode,
        editFormData, setEditFormData,
        newCategoryData, setNewCategoryData,
        selectedCategoryId, setSelectedCategoryId,
        newCriteriaText, setNewCriteriaText,
        aggregatedCriteria,
        juryList,
        criteriaList,

        // Standard Handlers
        handleSaveUpdate, handleStatusChange, cancelEditing,
        handleAddCategory, handleDeleteCategory, handleAddCriteria, handleDeleteCriteria,
        handleOpenJuryModal, handleAssignJury, handleRemoveJury, handleOpenStats, handleDeleteRound,

        // Auto Assign & Submissions
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