import {useCallback, useEffect, useState} from "react";
import {userService} from "../../../../../services/impl/UserService";
import {roundService} from "../../../../../services/impl/RoundService";
import {submissionService} from "../../../../../services/impl/SubmissionService";

export const useRoundJuryManager = ({
                                        roundId,
                                        fetchJury,
                                        fetchSubmissions,
                                        clearErrors,
                                        handleError,
                                        triggerConfirm,
                                        closeConfirm,
                                        t
                                    }: any) => {

    const [juryModalOpen, setJuryModalOpen] = useState(false);
    const [submissionJuryModalOpen, setSubmissionJuryModalOpen] = useState(false);

    const [availableJuries, setAvailableJuries] = useState<any[]>([]);
    const [availableSubmissionJuries, setAvailableSubmissionJuries] = useState<any[]>([]);

    const [selectedJuryToAssign, setSelectedJuryToAssign] = useState<any>(null);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isSubJurySearching, setIsSubJurySearching] = useState(false);

    const [juryPage, setJuryPage] = useState(1);
    const [juryTotalPages, setJuryTotalPages] = useState(1);
    const [subJuryPage, setSubJuryPage] = useState(1);
    const [subJuryTotalPages, setSubJuryTotalPages] = useState(1);

    const [kValue, setKValue] = useState(3);

    const [autoAssignModalOpen, setAutoAssignModalOpen] = useState(false);

    
    useEffect(() => {
        if (!juryModalOpen) return;

        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await userService.getJuries({
                    query: inputValue,
                    page: juryPage - 1,
                    size: 10
                });

                setAvailableJuries(res.content || []);
                setJuryTotalPages(res.totalPages || 1);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [inputValue, juryPage, juryModalOpen]);

    useEffect(() => {
        if (!submissionJuryModalOpen || !selectedSubmissionId) return;

        const timeout = setTimeout(async () => {
            setIsSubJurySearching(true);
            try {
                const res = await submissionService.getAvailableJuries(selectedSubmissionId, {
                    query: inputValue,
                    page: subJuryPage - 1,
                    size: 10
                });

                setAvailableSubmissionJuries(res.content || []);
                setSubJuryTotalPages(res.totalPages || 1);
            } finally {
                setIsSubJurySearching(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [inputValue, subJuryPage, submissionJuryModalOpen, selectedSubmissionId]);

    
    const handleAssignJury = useCallback(async () => {
        if (!selectedJuryToAssign) return;

        clearErrors();
        try {
            await roundService.setJuryToRound(roundId, selectedJuryToAssign.id);
            setJuryModalOpen(false);
            await fetchJury();
        } catch (e) {
            handleError(e, "Помилка призначення журі");
        }
    }, [selectedJuryToAssign]);

    const handleAssignJuryToSubmission = useCallback(async () => {
        if (!selectedSubmissionId || !selectedJuryToAssign) return;

        clearErrors();
        try {
            await submissionService.assignJury(selectedSubmissionId, selectedJuryToAssign.id);
            setSubmissionJuryModalOpen(false);
            await fetchSubmissions();
        } catch (e) {
            handleError(e, "Помилка призначення журі");
        }
    }, [selectedSubmissionId, selectedJuryToAssign]);

    const handleRemoveJury = useCallback((juryId: number) => {
        triggerConfirm({
            title: t('round_details.confirm.removeJury.title'),
            description: t('round_details.confirm.removeJury.description'),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundService.removeJuryFromRound(roundId, juryId);
                    await fetchJury();
                    closeConfirm();
                } catch (e) {
                    handleError(e, "Помилка видалення журі");
                }
            }
        });
    }, []);

    const handleAutoAssignJuries = useCallback(() => {
        triggerConfirm({
            title: t('round_details.confirm.autoAssignJuries.title'),
            description: t('round_details.confirm.autoAssignJuries.description'),
            confirmColor: "error",
            onConfirm: async () => {
                try {
                    await roundService.autoAssignJuries(roundId, kValue);
                    await fetchSubmissions();
                    closeConfirm();
                } catch (e) {
                    handleError(e, "Помилка авто призначення");
                }
            }
        });
    }, [kValue]);

    const handleOpenJuryModal = () => {
        clearErrors();
        setInputValue("");
        setJuryPage(1);
        setSelectedJuryToAssign(null);
        setJuryModalOpen(true);
    };

    const handleOpenSubmissionJuryModal = (submissionId: number) => {
        clearErrors();
        setSelectedSubmissionId(submissionId);
        setInputValue("");
        setSubJuryPage(1);
        setSelectedJuryToAssign(null);
        setSubmissionJuryModalOpen(true);
    };

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

    const handleSearchChange = useCallback((value: string) => {
        setInputValue(value);
        setJuryPage(1);
        setSubJuryPage(1);
    }, []);

    return {
        juryModalOpen, setJuryModalOpen,
        submissionJuryModalOpen, setSubmissionJuryModalOpen,

        availableJuries,
        availableSubmissionJuries,

        selectedJuryToAssign, setSelectedJuryToAssign,
        selectedSubmissionId, setSelectedSubmissionId,

        inputValue, setInputValue,
        isSearching, isSubJurySearching,

        juryPage, setJuryPage, juryTotalPages,
        subJuryPage, setSubJuryPage, subJuryTotalPages,

        kValue, setKValue,

        handleAssignJury,
        handleAssignJuryToSubmission,
        handleRemoveJury,
        handleAutoAssignJuries,

        handleOpenJuryModal,
        handleOpenSubmissionJuryModal,

        setAutoAssignModalOpen,
        handleRemoveJuryFromSubmission,
        autoAssignModalOpen,
        handleSearchChange
    };
};