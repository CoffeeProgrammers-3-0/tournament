import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";

export const CreateRoundDialog = ({ state, t, tournament }: any) => {
    const { roundModalOpen, setRoundModalOpen, roundFormData, handleRoundFormChange, handleCreateRound, isCreatingRound } = state;

    return (
        <Dialog open={roundModalOpen} onClose={() => setRoundModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {t("tournament_details.admin.create_modal.title")}
                <IconButton onClick={() => setRoundModalOpen(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                <ErrorMessages errors={state.errors} />
                <TextField required label={t("tournament_details.admin.create_modal.name")} name="name" value={roundFormData.name} onChange={handleRoundFormChange} fullWidth />
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField required label={t("tournament_details.admin.create_modal.start")} name="startDate" type="datetime-local" value={roundFormData.startDate} onChange={handleRoundFormChange} fullWidth InputLabelProps={{ shrink: true }}  inputProps={{ min: tournament.startTournament || undefined, max: roundFormData.endDate }} />
                    <TextField required label={t("tournament_details.admin.create_modal.end")} name="endDate" type="datetime-local" value={roundFormData.endDate} onChange={handleRoundFormChange} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ min: roundFormData.startDate || undefined }} />
                </Box>
                <TextField required label={t("tournament_details.admin.create_modal.winners")} name="countOfWinners" type="number" value={roundFormData.countOfWinners} onChange={handleRoundFormChange} fullWidth inputProps={{ min: 1 }} />
                <TextField required label={t("tournament_details.admin.create_modal.task")} name="task" value={roundFormData.task} onChange={handleRoundFormChange} multiline rows={4} fullWidth placeholder={t("tournament_details.admin.create_modal.name_placeholder")} />
                <TextField required label={t("tournament_details.admin.create_modal.requ")} name="requirements" value={roundFormData.requirements} onChange={handleRoundFormChange} multiline rows={4} fullWidth placeholder={t("tournament_details.admin.create_modal.name_placeholder")} />
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button onClick={() => setRoundModalOpen(false)} sx={{ fontWeight: 700, px: 3 }}>{t("common.cancel")}</Button>
                <Button variant="contained" color="secondary" onClick={handleCreateRound} sx={{ fontWeight: 800, borderRadius: "12px", px: 4, color: "black" }} disabled={isCreatingRound}>
                    {isCreatingRound ? <CircularProgress size={24} /> : t("tournament_details.admin.create_modal.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};