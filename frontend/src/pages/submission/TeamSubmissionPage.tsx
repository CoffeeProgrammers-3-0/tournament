import {type ChangeEvent, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import DescriptionIcon from "@mui/icons-material/Description";

import {submissionService} from "../../services/impl/SubmissionService";
import type {SubmissionFullResponseDto, SubmissionRequestDto} from "../../entities/submission/submission.dto.ts";

export const TeamSubmissionPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Отримуємо roundId та опціонально submissionId з роутера
    // Наприклад: /rounds/:roundId/submission/:submissionId?
    const { roundId, submissionId } = useParams<{ roundId: string; submissionId?: string }>();

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [existingSubmission, setExistingSubmission] = useState<SubmissionFullResponseDto | null>(null);

    // Стейт форми
    const [formData, setFormData] = useState<SubmissionRequestDto>({
        githubLink: "",
        videoLink: "",
        description: "",
    });

    // Перевірка, чи є вже подана робота
    useEffect(() => {
        const fetchSubmission = async () => {
            if (!submissionId) return; // Якщо ID немає, вважаємо, що це нове створення

            setLoading(true);
            try {
                const data = await submissionService.getSubmissionById(Number(submissionId));
                setExistingSubmission(data);
                setFormData({
                    githubLink: data.githubLink,
                    videoLink: data.videoLink,
                    description: data.description || ""
                });
            } catch (err: any) {
                console.error("Failed to load submission", err);
                setError(t('submission.errors.load_failed', 'Не вдалося завантажити дані подачі.'));
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submissionId, t]);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roundId) {
            setError(t('submission.errors.no_round', 'Помилка: Не вказано ID раунду.'));
            return;
        }

        setActionLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (existingSubmission) {
                // Оновлення існуючої роботи
                const updated = await submissionService.updateSubmission(existingSubmission.id, formData);
                setExistingSubmission(updated);
                setSuccessMsg(t('submission.success.updated', 'Рішення успішно оновлено!'));
            } else {
                // Створення нової роботи
                const created = await submissionService.sendSubmission(Number(roundId), formData);
                setExistingSubmission(created);
                setSuccessMsg(t('submission.success.created', 'Рішення успішно відправлено!'));

                // Опціонально: оновити URL, щоб додати ID створеної роботи,
                // navigate(`/rounds/${roundId}/submission/${created.id}`, { replace: true });
            }
        } catch (err: any) {
            console.error("Failed to save submission", err);
            setError(err.response?.data?.message || t('submission.errors.save_failed', 'Помилка збереження.'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingSubmission) return;

        if (!window.confirm(t('submission.actions.delete_confirm', 'Ви впевнені, що хочете видалити своє рішення? Цю дію неможливо скасувати.'))) {
            return;
        }

        setActionLoading(true);
        setError(null);

        try {
            await submissionService.deleteSubmission(existingSubmission.id);
            setExistingSubmission(null);
            setFormData({ githubLink: "", videoLink: "", description: "" });
            setSuccessMsg(t('submission.success.deleted', 'Рішення було успішно видалено.'));

            // За бажанням: повернутися назад після видалення
            // setTimeout(() => navigate(-1), 1500);
        } catch (err: any) {
            console.error("Failed to delete submission", err);
            setError(err.response?.data?.message || t('submission.errors.delete_failed', 'Не вдалося видалити.'));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    }

    const isEditMode = !!existingSubmission;

    return (
        <Box sx={{ pb: 8, maxWidth: "750px", mx: "auto" }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, textTransform: "none", fontWeight: 600 }}
            >
                {t('common.back', 'Назад')}
            </Button>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: "24px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Декоративний елемент зверху */}
                <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "6px",
                    bgcolor: isEditMode ? "success.main" : "primary.main"
                }} />

                <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{
                            bgcolor: isEditMode ? "success.light" : "primary.light",
                            color: isEditMode ? "success.main" : "primary.main",
                            width: 56, height: 56
                        }}>
                            <CloudUploadIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="text.primary">
                                {isEditMode
                                    ? t('submission.title_update', 'Ваше рішення')
                                    : t('submission.title_create', 'Завантаження рішення')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditMode
                                    ? t('submission.subtitle_update', 'Ви можете оновити або видалити подані матеріали до дедлайну.')
                                    : t('submission.subtitle_create', 'Завантажте посилання на репозиторій та відео-демо.')}
                            </Typography>
                        </Box>
                    </Box>

                    {isEditMode && (
                        <Tooltip title={t('submission.actions.delete', 'Видалити рішення')}>
                            <IconButton color="error" onClick={handleDelete} disabled={actionLoading}>
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Divider sx={{ mb: 4 }} />

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>{successMsg}</Alert>}

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                            <GitHubIcon color="action" sx={{ mb: 1.5 }} />
                            <TextField
                                label={t('submission.fields.github', 'Посилання на GitHub (обов’язково)')}
                                name="githubLink"
                                fullWidth
                                required
                                placeholder="https://github.com/your-team/project"
                                value={formData.githubLink}
                                onChange={handleFormChange}
                                disabled={actionLoading}
                                variant="standard"
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                            <YouTubeIcon color="action" sx={{ mb: 1.5 }} />
                            <TextField
                                label={t('submission.fields.video', 'Відео-демо (обов’язково)')}
                                name="videoLink"
                                type="url"
                                fullWidth
                                required
                                placeholder="https://youtube.com/... або Google Drive"
                                value={formData.videoLink}
                                onChange={handleFormChange}
                                disabled={actionLoading}
                                variant="standard"
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                            <DescriptionIcon color="action" sx={{ mt: 2 }} />
                            <TextField
                                label={t('submission.fields.description', 'Короткий опис проекту (що зроблено, як запускати)')}
                                name="description"
                                multiline
                                rows={4}
                                fullWidth
                                placeholder={t('submission.fields.description_placeholder', 'Коротко опишіть ваш проект...')}
                                value={formData.description}
                                onChange={handleFormChange}
                                disabled={actionLoading}
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        disabled={actionLoading}
                        sx={{ borderRadius: "12px", px: 3 }}
                    >
                        {t('common.cancel', 'Скасувати')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color={isEditMode ? "success" : "primary"}
                        startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? <EditIcon /> : <SendIcon />)}
                        disabled={actionLoading}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: "12px",
                            fontWeight: 700,
                            boxShadow: isEditMode
                                ? "0 4px 14px 0 rgba(46,125,50,0.39)"
                                : "0 4px 14px 0 rgba(0,118,255,0.39)"
                        }}
                    >
                        {actionLoading
                            ? t('common.loading', 'Завантаження...')
                            : (isEditMode
                                    ? t('submission.actions.update', 'Оновити рішення')
                                    : t('submission.actions.submit', 'Відправити рішення')
                            )
                        }
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};