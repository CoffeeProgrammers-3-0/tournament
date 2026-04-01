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
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {useNavigate} from "react-router-dom";
import {useJuryEvaluate} from "./useJuryEvaluate";
import {SubmissionDetails} from "./components/SubmissionDetails";
import {GradingForm} from "./components/GradingForm";
import {ErrorMessages} from "../../../components/main/ErrorMessages";

export const JuryEvaluatePage = () => {
    const navigate = useNavigate();
    const {
        submission, categories, scores, loading, saving, errors,
        showSuccessDialog, setShowSuccessDialog, handleScoreChange, handleSaveScores, t
    } = useJuryEvaluate();

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress thickness={5} /></Box>;
    if (!submission) return <Typography align="center" sx={{ mt: 10 }}>{t('common.no_data')}</Typography>;

    // Визначаємо, чи доступне оцінювання
    const isReadOnly = submission.round.status === "EVALUATED";

    return (
        <Box sx={{ pb: 8, maxWidth: "900px", mx: "auto", pt: 1 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, fontWeight: 700, textTransform: 'none' }}
            >
                {t('common.back')}
            </Button>

            <ErrorMessages errors={errors} />

            {isReadOnly && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: '16px', '& .MuiAlert-message': { fontWeight: 600 } }}>
                    {t('jury.info.round_evaluated', 'Цей раунд завершено. Оцінки доступні лише для перегляду і не можуть бути змінені.')}
                </Alert>
            )}

            <SubmissionDetails submission={submission} t={t} />

            {categories.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: '20px' }}>
                    <Typography color="text.secondary">{t('jury.no_categories')}</Typography>
                </Box>
            ) : (
                <>
                    <GradingForm
                        categories={categories}
                        scores={scores}
                        onScoreChange={handleScoreChange}
                        disabled={saving || isReadOnly}
                        t={t}
                    />

                    {/* Показуємо кнопку збереження ТІЛЬКИ якщо раунд не завершено */}
                    {!isReadOnly && (
                        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={handleSaveScores}
                                disabled={saving}
                                sx={{ borderRadius: "16px", px: 6, py: 2, fontWeight: 800, boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)' }}
                            >
                                {saving ? t('common.saving') : t('jury.actions.save_scores')}
                            </Button>
                        </Box>
                    )}
                </>
            )}

            <Dialog
                open={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                PaperProps={{ sx: { borderRadius: "24px", p: 1, maxWidth: '400px', textAlign: 'center' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>
                    🎉 {t('common.success', 'Збережено!')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 500 }}>
                        {t('jury.success.scores_saved')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setShowSuccessDialog(false)}
                        sx={{ borderRadius: "12px", fontWeight: 700 }}
                    >
                        {t('common.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};