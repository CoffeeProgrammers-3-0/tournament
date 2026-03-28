import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";

type Props = {
    open: boolean;
    onClose: () => void;
    newCategoryData: { title: string; weight: number };
    setNewCategoryData: React.Dispatch<React.SetStateAction<{ title: string; weight: number }>>;
    onSubmit: () => Promise<void>;
    t: (key: string, options?: any) => string;
    errors: string[];
};

export const CategoryDialog = ({ open, onClose, newCategoryData, setNewCategoryData, onSubmit, t, errors }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.category_modal.title")}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                <ErrorMessages errors={errors}/>
                <TextField
                    label={t("round_details.admin.category_modal.name")}
                    fullWidth
                    value={newCategoryData.title}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, title: e.target.value })}
                />
                <TextField
                    label={t("round_details.admin.category_modal.weight")}
                    type="number"
                    inputProps={{ step: "0.1", min: "0", max: "1" }}
                    fullWidth
                    value={newCategoryData.weight}
                    onChange={(e) => setNewCategoryData({ ...newCategoryData, weight: Number(e.target.value) })}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit">{t("round_details.admin.cancel")}</Button>
                <Button variant="contained" onClick={onSubmit} sx={{ fontWeight: 700 }} disabled={!newCategoryData.title}>
                    {t("round_details.admin.category_modal.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};