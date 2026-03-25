import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Link,
    Paper,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SaveIcon from "@mui/icons-material/Save";

import {submissionService} from "../../services/impl/SubmissionService";
import {categoryService} from "../../services/impl/CategoryService";
import {juryCriteriaService} from "../../services/impl/JuryCriteriaService";

import type {SubmissionFullResponseDto} from "../../entities/submission/submission.dto.ts";
import type {CategoryResponseDto} from "../../entities/category/category.dto.ts";
import type {JuryCriteriaResponseDto} from "../../entities/juryCriteria/juryCriteria.dto.ts";

export const JuryEvaluatePage = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [submission, setSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

    // Зберігаємо бали: ключ - criteriaId, значення - points
    const [scores, setScores] = useState<Record<number, number>>({});
    // Зберігаємо існуючі оцінки для розуміння: робити POST (setScore) чи PUT (updateScore)
    const [existingScores, setExistingScores] = useState<Record<number, JuryCriteriaResponseDto>>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) return;
            setLoading(true);
            try {
                // 1. Отримуємо деталі роботи
                const subData = await submissionService.getSubmissionById(Number(submissionId));
                setSubmission(subData);

                // 2. Отримуємо категорії та критерії для цього раунду
                const catData = await categoryService.getCategories(subData.round.id);
                setCategories(catData);

                // 3. Отримуємо вже виставлені оцінки (якщо журі повертається до редагування)
                const scoresData = await juryCriteriaService.getMyScoresForSubmission(Number(submissionId));

                const scoresMap: Record<number, number> = {};
                const existingMap: Record<number, JuryCriteriaResponseDto> = {};

                scoresData.forEach(sc => {
                    scoresMap[sc.criteria.id] = sc.points;
                    existingMap[sc.criteria.id] = sc;
                });

                setScores(scoresMap);
                setExistingScores(existingMap);

            } catch (err) {
                console.error("Failed to load evaluation data", err);
                setError(t('jury.errors.load_eval_failed', 'Помилка завантаження даних для оцінювання.'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [submissionId, t]);

    const handleScoreChange = (criteriaId: number, value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        // Обмеження шкали (наприклад, 0-100)
        const clampedValue = Math.min(Math.max(numValue, 0), 100);

        setScores(prev => ({ ...prev, [criteriaId]: clampedValue }));
    };

    const handleSaveScores = async () => {
        if (!submissionId) return;
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const promises = [];

            // Проходимось по всім критеріям у всіх категоріях
            for (const category of categories) {
                for (const criteria of category.criteria) {
                    const points = scores[criteria.id];

                    if (points !== undefined) {
                        const payload = { value: points } as any; // LongDto - адаптуйте під вашу реалізацію LongDto (зазвичай { value: number })

                        if (existingScores[criteria.id]) {
                            // Якщо оцінка вже була - оновлюємо
                            // Перевіряємо, чи змінився бал, щоб не робити зайвих запитів
                            if (existingScores[criteria.id].points !== points) {
                                promises.push(juryCriteriaService.updateScore(Number(submissionId), criteria.id, payload));
                            }
                        } else {
                            // Якщо оцінки не було - створюємо
                            promises.push(juryCriteriaService.setScore(Number(submissionId), criteria.id, payload));
                        }
                    }
                }
            }

            await Promise.all(promises);
            setSuccess(t('jury.success.scores_saved', 'Оцінки успішно збережено!'));

            // Оновлюємо існуючі оцінки після збереження
            const newScoresData = await juryCriteriaService.getMyScoresForSubmission(Number(submissionId));
            const existingMap: Record<number, JuryCriteriaResponseDto> = {};
            newScoresData.forEach(sc => existingMap[sc.criteria.id] = sc);
            setExistingScores(existingMap);

        } catch (err) {
            console.error("Failed to save scores", err);
            setError(t('jury.errors.save_failed', 'Не вдалося зберегти оцінки. Перевірте підключення.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (!submission) return <Typography>No data found.</Typography>;

    return (
        <Box sx={{ pb: 8, maxWidth: "900px", mx: "auto" }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 600 }}>
                {t('common.back', 'Назад до списку')}
            </Button>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            {/* Блок з інформацією про роботу */}
            <Paper sx={{ p: 4, borderRadius: "24px", mb: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    {submission.team.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {t('jury.round_label', 'Раунд')}: {submission.round.name}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <GitHubIcon />
                            <Link href={submission.githubLink} target="_blank" rel="noopener noreferrer" fontWeight={600}>
                                {t('jury.view_github', 'Репозиторій GitHub')}
                            </Link>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <YouTubeIcon color="error" />
                            <Link href={submission.videoLink} target="_blank" rel="noopener noreferrer" fontWeight={600}>
                                {t('jury.view_video', 'Відео-демо')}
                            </Link>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            {t('jury.submission_desc', 'Опис від команди:')}
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", bgcolor: "#fafafa" }}>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                {submission.description || t('jury.no_description', 'Команда не залишила опис.')}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Блок виставлення оцінок */}
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
                {t('jury.grading_rubric', 'Рубрика оцінювання')}
            </Typography>

            {categories.length === 0 ? (
                <Alert severity="warning">{t('jury.no_categories', 'Для цього раунду ще не налаштовано критерії оцінювання.')}</Alert>
            ) : (
                categories.map((category) => (
                    <Accordion key={category.id} defaultExpanded sx={{ mb: 2, borderRadius: "16px !important", overflow: "hidden", "&:before": { display: "none" }, border: "1px solid #eee", boxShadow: "none" }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8f9fa" }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>{category.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('jury.category_weight', 'Вага категорії')}: {category.weight}%
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                {category.criteria.map((criteria) => (
                                    <Grid size={{ xs: 12 }} key={criteria.id}>
                                        <Box sx={{ display: "flex", gap: 3, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                            <Typography variant="body1" sx={{ flex: 1, minWidth: "200px" }}>
                                                {criteria.text}
                                            </Typography>
                                            <TextField
                                                type="number"
                                                label={t('jury.score_0_100', 'Бали (0-100)')}
                                                size="small"
                                                value={scores[criteria.id] !== undefined ? scores[criteria.id] : ""}
                                                onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                                                disabled={saving}
                                                inputProps={{ min: 0, max: 100, step: 1 }}
                                                sx={{ width: "120px" }}
                                            />
                                        </Box>
                                        <Divider sx={{ mt: 2 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            {categories.length > 0 && (
                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSaveScores}
                        disabled={saving}
                        sx={{ borderRadius: "12px", px: 5, py: 1.5, fontWeight: 700 }}
                    >
                        {saving ? t('common.saving', 'Збереження...') : t('jury.actions.save_scores', 'Зберегти оцінки')}
                    </Button>
                </Box>
            )}
        </Box>
    );
};