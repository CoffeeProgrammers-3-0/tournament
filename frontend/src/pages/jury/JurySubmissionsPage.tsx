import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Typography} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import {submissionService} from "../../services/impl/SubmissionService";
import type {SubmissionListResponseDto} from "../../entities/submission/submission.dto.ts";

export const JurySubmissionsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState<SubmissionListResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                // Завантажуємо першу сторінку (можна додати повноцінну пагінацію за потреби)
                const response = await submissionService.getSubmissionsForJury({ page: 0, size: 50 });
                setSubmissions(response.content);
            } catch (err: any) {
                console.error("Failed to fetch jury submissions", err);
                setError(t('jury.errors.load_list_failed', 'Не вдалося завантажити список робіт.'));
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [t]);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ pb: 8, maxWidth: "1000px", mx: "auto" }}>
            <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", width: 56, height: 56 }}>
                    <AssignmentTurnedInIcon fontSize="large" />
                </Avatar>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {t('jury.submissions_title', 'Мої роботи для оцінювання')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('jury.submissions_subtitle', 'Список команд та рішень, які вам призначено перевірити.')}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: "12px" }}>{error}</Alert>}

            {!error && submissions.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                    {t('jury.no_submissions', 'Наразі вам не призначено жодної роботи для оцінювання.')}
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {submissions.map((submission) => (
                        <Grid size={{ xs: 12, md: 6 }} key={submission.id}>
                            <Card sx={{
                                borderRadius: "20px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                border: "1px solid",
                                borderColor: "divider",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {submission.team.name}
                                        </Typography>
                                        <Chip label={submission.round.name} color="secondary" size="small" variant="outlined" />
                                    </Box>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() => navigate(`/jury/evaluate/${submission.id}`)}
                                        sx={{ borderRadius: "10px", fontWeight: 600, mt: 2 }}
                                    >
                                        {t('jury.actions.evaluate', 'Оцінити роботу')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};