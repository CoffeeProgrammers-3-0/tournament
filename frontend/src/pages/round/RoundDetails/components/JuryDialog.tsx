import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";

type Props = {
    open: boolean;
    onClose: () => void;
    juryAssignId: string;
    setJuryAssignId: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: () => Promise<void>;
    t: (key: string, options?: any) => string;
};

export const JuryDialog = ({ open, onClose, juryAssignId, setJuryAssignId, onSubmit, t }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.jury_modal.title")}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                <TextField
                    label={t("round_details.admin.jury_modal.id")}
                    fullWidth
                    value={juryAssignId}
                    onChange={(e) => setJuryAssignId(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">{t("round_details.admin.cancel")}</Button>
                <Button variant="contained" onClick={onSubmit} sx={{ fontWeight: 700 }} disabled={!juryAssignId}>
                    {t("round_details.admin.jury_modal.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};