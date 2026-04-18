import {useCallback, useState} from "react";
import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../../entities/round/round.dto";
import {roundService} from "../../../../../services/impl/RoundService";
import type {ConfirmDialogConfig} from "../../hooks/useRoundEditors.ts";
import {toLocalInput, toUtcIso} from "../../../../../utils/data.ts";

export const useRoundInfoEditor = ({
                                       roundId,
                                       roundData,
                                       setRoundData,
                                       clearErrors,
                                       handleError,
                                       triggerConfirm,
    t
                                   }: {
    roundId: number;
    roundData: RoundFullResponseDto | null;
    setRoundData: any;
    clearErrors: () => void;
    handleError: (e: any, msg: string) => void;
    triggerConfirm: (dialog: ConfirmDialogConfig) => void,
    t: any
}) => {

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as any);

    const handleSaveUpdate = useCallback(async () => {
        if (!roundId || !roundData) return;
        clearErrors();

        try {
            const payload = {
                ...editFormData,
                startDate: toUtcIso(editFormData.startDate),
                endDate: toUtcIso(editFormData.endDate),
            };

            const updated = await roundService.updateRound(roundId, payload);
            setRoundData(updated);
            setIsEditingInfo(false);
        } catch (e) {
            handleError(e, t('round_details.errors.updateRound'));
        }
    }, [editFormData, roundId, roundData]);

    const handleStatusChange = useCallback((newStatus: RoundStatus) => {
        setEditFormData(prev => {

            let sDate = prev.startDate ? new Date(toUtcIso(prev.startDate)) : new Date();
            let eDate = prev.endDate ? new Date(toUtcIso(prev.endDate)) : new Date(sDate.getTime() + 86400000);
            const now = new Date();

            if (newStatus === "DRAFT") {
                if (sDate <= now) sDate = new Date(now.getTime() + 3600000);
                if (eDate <= sDate) eDate = new Date(sDate.getTime() + 86400000);
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
                startDate: toLocalInput(sDate.toISOString()),
                endDate: toLocalInput(eDate.toISOString())
            };
        });
    }, []);

    const handleDeleteRound = useCallback(() => {
        triggerConfirm({
            open: true,
            title: t('round_details.confirm.deleteRound.title'),
            description: t('round_details.confirm.deleteRound.description'),
            confirmColor: "error",
            onConfirm: async () => {
                clearErrors();
                try {
                    await roundService.deleteRound(roundId);
                    window.location.href = `/tournament`;
                } catch (error: any) {
                    handleError(error, t('round_details.errors.deleteRound'));
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