import {useCallback, useState} from "react";
import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../entities/round/round.dto";
import {roundService} from "../../../../services/impl/RoundService";
import type {ConfirmDialogConfig} from "./useRoundEditors.ts";

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

const toDateTimeLocal = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const useRoundInfoEditor = ({
                                       roundId,
                                       roundData,
                                       setRoundData,
                                       clearErrors,
                                       handleError,
                                       triggerConfirm
                                   }: {
    roundId: number;
    roundData: RoundFullResponseDto | null;
    setRoundData: any;
    clearErrors: () => void;
    handleError: (e: any, msg: string) => void;
    triggerConfirm: (dialog: ConfirmDialogConfig) => void
}) => {

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as any);

    const handleSaveUpdate = useCallback(async () => {
        if (!roundId || !roundData) return;
        clearErrors();

        try {
            const payload = {
                ...editFormData,
                startDate: formatToLocalDateTime(editFormData.startDate),
                endDate: formatToLocalDateTime(editFormData.endDate),
            };

            const updated = await roundService.updateRound(roundId, payload);
            setRoundData(updated);
            setIsEditingInfo(false);
        } catch (e) {
            handleError(e, "Помилка оновлення раунду");
        }
    }, [editFormData, roundId, roundData]);

    const handleStatusChange = useCallback((newStatus: RoundStatus) => {
        setEditFormData(prev => {
            const now = new Date();
            let sDate = prev.startDate ? new Date(prev.startDate) : new Date();
            let eDate = prev.endDate ? new Date(prev.endDate) : new Date(now.getTime() + 86400000);

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

            return {
                ...prev,
                status: newStatus,
                startDate: toDateTimeLocal(sDate),
                endDate: toDateTimeLocal(eDate)
            };
        });
    }, []);

    const handleDeleteRound = useCallback(() => {
        triggerConfirm({
            open: true,
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


    return {
        isEditingInfo,
        setIsEditingInfo,
        editFormData,
        setEditFormData,
        handleSaveUpdate,
        handleStatusChange,
        handleDeleteRound
    };
};