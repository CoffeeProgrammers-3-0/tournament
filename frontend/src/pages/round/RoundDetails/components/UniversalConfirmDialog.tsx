import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";

export const UniversalConfirmDialog = ({ config, onClose, errors }: { config: any, onClose: () => void, errors: string[] }) => {
    const {t} = useTranslation();

    return (
        <Dialog
            open={config.open}
            onClose={onClose}
            PaperProps={{ sx: { borderRadius: "20px", p: 1, minWidth: "320px" } }}
        >
            <ErrorMessages errors={errors} />
            <DialogTitle sx={{ fontWeight: 800 }}>{config.title}</DialogTitle>
            <DialogContent>
                <DialogContentText color="text.primary">
                    {config.description}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
                    {t("common.cancel")}
                </Button>
                <Button
                    variant="contained"
                    color={config.confirmColor || "primary"}
                    onClick={config.onConfirm}
                    disabled={config.isLoading}
                    sx={{ borderRadius: "10px", px: 3, fontWeight: 700 }}
                >
                    {config.isLoading ? <CircularProgress size={24} /> : t("common.yes_confirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};