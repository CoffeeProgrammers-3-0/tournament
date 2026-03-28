import {useState} from "react";
import {useParams} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Paper,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock"; // Нова іконка
import {SubmissionHeader} from "./components/SubmissionHeader.tsx";
import {SubmissionFormFields} from "./components/SubmissionFormFields.tsx";

import {ErrorMessages} from "../../components/main/ErrorMessages"; // Ваш універсальний компонент
import {useTeamSubmission} from "./useTeamSubmission.tsx";

export const TeamSubmissionPage = () => {
    const { roundId, submissionId } = useParams<{ roundId: string; submissionId?: string }>();
    const {
        formData, setFormData, loading, actionLoading, errors, setErrors, successMsg,
        existingSubmission, isLocked, handleSubmit, deleteSubmission, navigate, t
    } = useTeamSubmission(roundId, submissionId);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErrors([])
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const confirmDelete = async () => {
        const success = await deleteSubmission();
        if (success) setDeleteDialogOpen(false);
    };

    return (
        <Box sx={{ pb: 8, maxWidth: "750px", mx: "auto", pt: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 700 }}>
                {t('common.back')}
            </Button>

            <Paper component="form" onSubmit={handleSubmit} sx={{
                p: { xs: 4, md: 6 }, borderRadius: "24px", position: "relative", overflow: "hidden",
                bgcolor: isLocked ? "grey.50" : "background.paper",
                boxShadow: "0 12px 40px rgba(0,0,0,0.08)"
            }}>
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px",
                    bgcolor: isLocked ? "grey.400" : (existingSubmission ? "success.main" : "primary.main") }} />

                <SubmissionHeader
                    isLocked={isLocked}
                    isEditMode={!!existingSubmission}
                    actionLoading={actionLoading}
                    onDelete={() => setDeleteDialogOpen(true)} // Відкриваємо діалог замість window.confirm
                    t={t}
                />

                <Divider sx={{ mb: 4 }} />

                {/* ГАРНИЙ ВИВІД ПОМИЛОК */}
                <ErrorMessages errors={errors} />

                {isLocked && (
                    <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3, borderRadius: "12px" }}>
                        {t('submission.alerts.locked')}
                    </Alert>
                )}

                {successMsg && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
                        {successMsg}
                    </Alert>
                )}

                <SubmissionFormFields
                    formData={formData}
                    isLocked={isLocked}
                    actionLoading={actionLoading}
                    onChange={handleFormChange}
                    t={t}
                />

                <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={() => navigate(-1)} sx={{ borderRadius: "12px" }}>
                        {isLocked ? t('common.close') : t('common.cancel')}
                    </Button>

                    {!isLocked && (
                        <Button
                            type="submit" variant="contained"
                            color={existingSubmission ? "success" : "primary"}
                            disabled={actionLoading}
                            sx={{ borderRadius: "12px", px: 4, fontWeight: 700 }}
                            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : (existingSubmission ? <EditIcon /> : <SendIcon />)}
                        >
                            {actionLoading ? t('common.loading') : (existingSubmission ? t('submission.actions.update') : t('submission.actions.submit'))}
                        </Button>
                    )}
                </Box>
            </Paper>

            {/* MODERN DELETE DIALOG */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>{t('submission.actions.delete_confirm_title', 'Видалити рішення?')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('submission.actions.delete_confirm_text', 'Ви впевнені, що хочете видалити це рішення? Цю дію неможливо буде скасувати.')}</DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: "10px" }}>
                        {t('common.no')}
                    </Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" sx={{ borderRadius: "10px", fontWeight: 700 }}>
                        {t('common.yes_confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};