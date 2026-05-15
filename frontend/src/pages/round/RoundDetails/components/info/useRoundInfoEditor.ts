import {useCallback, useState} from "react";
import {roundService} from "../../../../../services/impl/RoundService";
import {toLocalInput, toUtcIso} from "../../../../../utils/data.ts";
import type {TFunction} from "i18next";
import type {RoundFullResponseDto, RoundUpdateRequestDto} from "../../../../../entities/round/round.dto.ts";

interface UseRoundInfoEditorProps {
    roundId: number;
    roundData: RoundFullResponseDto | null;
    setRoundData: (data: RoundFullResponseDto) => void;
    fetchRound?: () => Promise<void>;
    clearErrors: () => void;
    handleError: (error: any, message: string) => void;
    t: TFunction;
    closeConfirm: () => void;
}

export const useRoundInfoEditor = ({
                                       roundId,
                                       roundData,
                                       setRoundData,
                                       fetchRound,
                                       clearErrors,
                                       handleError,
                                       t,
                                       closeConfirm,
                                   }: UseRoundInfoEditorProps) => {
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as RoundUpdateRequestDto);

    const initializeEditForm = useCallback(() => {
        if (!roundData) return;

        setEditFormData({
            name: roundData.name ?? "",
            startDate: toLocalInput(roundData.startDate),
            endDate: toLocalInput(roundData.endDate),
            countOfWinners: roundData.countOfWinners,
            requirements: roundData.requirements ?? "",
            task: roundData.task ?? "",
        });

        setIsEditingInfo(true);
    }, [roundData]);

    const execute = useCallback(
        async (actionFn: () => Promise<void>) => {
            clearErrors();
            try {
                await actionFn();
                if (fetchRound) await fetchRound();
                closeConfirm();
            } catch (e: any) {
                handleError(e, t("round_details.errors.actionFailed"));
            }
        },
        [clearErrors, closeConfirm, fetchRound, handleError, t],
    );

    const handleSaveUpdate = useCallback(async () => {
        if (!roundId || !roundData) return;

        clearErrors();

        try {
            const payload: RoundUpdateRequestDto = {
                ...roundData,
                ...editFormData,
                startDate: toUtcIso(editFormData.startDate),
                endDate: toUtcIso(editFormData.endDate),
            };

            const updated = await roundService.updateRound(roundId, payload);

            setRoundData(updated);
            setIsEditingInfo(false);
            setEditFormData({
                name: updated.name ?? "",
                startDate: toLocalInput(updated.startDate),
                endDate: toLocalInput(updated.endDate),
                countOfWinners: updated.countOfWinners,
                requirements: updated.requirements ?? "",
                task: updated.task ?? "",
            });
        } catch (e: any) {
            handleError(e, t("round_details.errors.updateRound"));
        }
    }, [clearErrors, editFormData, handleError, roundData, roundId, setRoundData, t]);

    return {
        isEditingInfo,
        setIsEditingInfo,
        editFormData,
        setEditFormData,
        initializeEditForm,
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
                    handleError(e, t("round_details.errors.delete"));
                }
            },
        },
    };
};