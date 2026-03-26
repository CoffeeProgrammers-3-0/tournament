import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";

type Props = {
    open: boolean;
    onClose: () => void;
    newCriteriaText: string;
    setNewCriteriaText: (text: string) => void;
    onSubmit: () => void;
    t: (key: string) => string;
};

export const CriteriaDialog = ({ open, onClose, newCriteriaText, setNewCriteriaText, onSubmit, t }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle fontWeight={700}>{t("round_details.categories.add_criteria")}</DialogTitle>
            <DialogContent sx={{ pt: "16px !important" }}>
                <TextField
                    fullWidth
                    label={t("round_details.categories.criteria_text")}
                    value={newCriteriaText}
                    onChange={(e) => setNewCriteriaText(e.target.value)}
                    multiline
                    rows={2}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    {t("common.cancel")}
                </Button>
                <Button onClick={onSubmit} variant="contained" disabled={!newCriteriaText.trim()}>
                    {t("common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};