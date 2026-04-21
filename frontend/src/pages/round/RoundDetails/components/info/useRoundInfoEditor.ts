import {useCallback, useState} from "react";
import {roundService} from "../../../../../services/impl/RoundService";
import {toUtcIso} from "../../../../../utils/data.ts";
import type {TFunction} from "i18next";
import type {RoundFullResponseDto, RoundUpdateRequestDto} from "../../../../../entities/round/round.dto.ts";

interface UseRoundInfoEditorProps {
    roundId: number;
    roundData: RoundFullResponseDto | null;
    setRoundData: (data: any) => void;
    fetchRound?: () => Promise<void>;
    clearErrors: () => void;
    handleError: (error: any, message: string) => void;
    t: TFunction;
}

export const useRoundInfoEditor = ({
                                       roundId,
                                       roundData,
                                       setRoundData,
                                       fetchRound,
                                       clearErrors,
                                       handleError,
                                       t
                                   }: UseRoundInfoEditorProps) => {

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as any);

    const execute = useCallback(async (actionFn: () => Promise<void>) => {
        clearErrors();
        try {
            await actionFn();
            if (fetchRound) await fetchRound();
        } catch (e: any) {
            handleError(e, t('round_details.errors.actionFailed'));

        }
    }, [clearErrors, handleError, fetchRound, t]);

    const handleSaveUpdate = useCallback(async (editFormData: any, setIsEditing: (val: boolean) => void) => {
        if (!roundId || !roundData) return;
        clearErrors();
        try {
            const payload = {
                ...roundData,
                ...editFormData,
                startDate: toUtcIso(editFormData.startDate),
                endDate: toUtcIso(editFormData.endDate),
            };
            const updated = await roundService.updateRound(roundId, payload);
            setRoundData(updated);
            setIsEditing(false);
            setEditFormData(updated)
        } catch (e: any) {
            handleError(e, t('round_details.errors.updateRound'));
        }
    }, [roundId, clearErrors, handleError, setRoundData, t]);

    return {
        isEditingInfo,
        setIsEditingInfo,
        editFormData,
        setEditFormData,
        handleSaveUpdate,
        actions: {
            start: () => execute(() => roundService.startRound(roundId)),
            close: () => execute(() => roundService.closeSubmissions(roundId)),
            evaluate: () => execute(() => roundService.evaluateRound(roundId)),
            rollbackClose: () => execute(() => roundService.rollbackCloseSubmissions(roundId)),
            rollbackStart: () => execute(() => roundService.rollbackStartRound(roundId)),
            toDraft: () => execute(() => roundService.setRoundToDraft(roundId)),
            delete: async () => {
                try {
                    await roundService.deleteRound(roundId);
                    window.location.href = `/tournaments/${roundData?.tournament.id}`;
                } catch (e: any) {
                    handleError(e, t('round_details.errors.delete'));
                }
            }
        }
    };
};