import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {useNavigate} from "react-router-dom";
import {useJuryEvaluate} from "./useJuryEvaluate";
import {SubmissionDetails} from "./components/SubmissionDetails";
import {GradingForm} from "./components/GradingForm";

export const JuryEvaluatePage = () => {
    const navigate = useNavigate();
    const { submission, categories, scores, loading, saving, status, handleScoreChange, handleSaveScores, t } = useJuryEvaluate();

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (!submission) return <Typography>No data found.</Typography>;

    return (
        <Box sx={{ pb: 8, maxWidth: "900px", mx: "auto", pt: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 700 }}>
                {t('common.back')}
            </Button>

            {status && <Alert severity={status.type} sx={{ mb: 3, borderRadius: "12px" }}>{status.msg}</Alert>}

            <SubmissionDetails submission={submission} t={t} />

            {categories.length === 0 ? (
                <Alert severity="warning">{t('jury.no_categories')}</Alert>
            ) : (
                <GradingForm
                    categories={categories}
                    scores={scores}
                    onScoreChange={handleScoreChange}
                    disabled={saving}
                    t={t}
                />
            )}

            {categories.length > 0 && (
                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained" size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSaveScores}
                        disabled={saving}
                        sx={{ borderRadius: "12px", px: 5, py: 1.5, fontWeight: 700 }}
                    >
                        {saving ? t('common.saving') : t('jury.actions.save_scores')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};