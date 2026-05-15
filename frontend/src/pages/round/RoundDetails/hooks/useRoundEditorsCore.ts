import {useCallback, useState} from "react";
import type {ConfirmDialogConfig} from "./useRoundEditors.ts";

export const useRoundEditorsCore = () => {
    const [errors, setErrors] = useState<string[]>([]);

    const clearErrors = useCallback(() => setErrors([]), []);

    const handleError = useCallback((error: any, defaultMessage: string) => {
        const messages = error.response?.data?.messages;
        setErrors(Array.isArray(messages) ? messages : [defaultMessage]);
    }, []);

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig>({
        open: false,
        title: "",
        description: "",
        onConfirm: () => {},
        confirmColor: "primary",
        isLoading: false
    });

    const closeConfirm = useCallback(() => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        clearErrors();
    }, [clearErrors]);

    const triggerConfirm = useCallback((config: Omit<ConfirmDialogConfig, 'open'>) => {
        setConfirmDialog({ ...config, open: true });
    }, []);

    const withErrorClear = useCallback(
        (setter: React.Dispatch<React.SetStateAction<boolean>>) =>
            (value: boolean | ((prev: boolean) => boolean)) => {
                if (value === false) clearErrors();
                setter(value);
            },
        [clearErrors]
    );

    return {
        errors,
        clearErrors,
        handleError,
        confirmDialog,
        triggerConfirm,
        closeConfirm,
        withErrorClear,
    };
};