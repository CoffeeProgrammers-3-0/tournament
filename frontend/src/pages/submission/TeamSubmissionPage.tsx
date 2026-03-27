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
import LockIcon from "@mui/icons-material/Lock"; // Нова іконка
import {submissionService} from "../../services/impl/SubmissionService";
import {roundService} from "../../services/impl/RoundService"; // Припускаємо наявність сервісу раундів
import type {SubmissionFullResponseDto, SubmissionRequestDto} from "../../entities/submission/submission.dto.ts";
import type {RoundFullResponseDto} from "../../entities/round/round.dto.ts";

export const TeamSubmissionPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { roundId, submissionId } = useParams<{ roundId: string; submissionId?: string }>();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [existingSubmission, setExistingSubmission] = useState<SubmissionFullResponseDto | null>(null);
    const [roundData, setRoundData] = useState<RoundFullResponseDto | null>(null);

    const [formData, setFormData] = useState<SubmissionRequestDto>({
        githubLink: "",
        videoLink: "",
        description: "",
    });

    // Визначаємо, чи заблокована форма
    const isLocked = roundData?.status !== "ACTIVE";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Завантажуємо дані раунду обов'язково
                if (roundId) {
                    const round = await roundService.getRoundById(Number(roundId));
                    setRoundData(round);
                }

                // 2. Завантажуємо сабмішн, якщо він є
                if (submissionId) {
                    const data = await submissionService.getSubmissionById(Number(submissionId));
                    setExistingSubmission(data);
                    setFormData({
                        githubLink: data.githubLink,
                        videoLink: data.videoLink,
                        description: data.description || ""
                    });
                }
            } catch (err: any) {
                console.error("Failed to load data", err);
                setError(t('submission.errors.load_failed'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roundId, submissionId, t]);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (isLocked) return; // Захист на рівні коду
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;

        setActionLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (existingSubmission) {
                const updated = await submissionService.updateSubmission(existingSubmission.id, formData);
                setExistingSubmission(updated);
                setSuccessMsg(t('submission.success.updated'));
            } else {
                const created = await submissionService.sendSubmission(Number(roundId), formData);
                setExistingSubmission(created);
                setSuccessMsg(t('submission.success.created'));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('submission.errors.save_failed'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingSubmission || isLocked) return;

        if (!window.confirm(t('submission.actions.delete_confirm'))) return;

        setActionLoading(true);
        try {
            await submissionService.deleteSubmission(existingSubmission.id);
            setExistingSubmission(null);
            setFormData({ githubLink: "", videoLink: "", description: "" });
            setSuccessMsg(t('submission.success.deleted'));
        } catch (err: any) {
            setError(err.response?.data?.message || t('submission.errors.delete_failed'));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    }

    const isEditMode = !!existingSubmission;

    return (
        <Box sx={{ pb: 8, maxWidth: "750px", mx: "auto", pt: 1 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, textTransform: "none", fontWeight: 600 }}
            >
                {t('common.back')}
            </Button>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: "24px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                    position: "relative",
                    overflow: "hidden",
                    bgcolor: isLocked ? "grey.50" : "background.paper"
                }}
            >
                {/* Колірна смуга зверху змінюється, якщо раунд заблоковано */}
                <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "6px",
                    bgcolor: isLocked ? "grey.400" : (isEditMode ? "success.main" : "primary.main")
                }} />

                <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{
                            bgcolor: isLocked ? "grey.400" : (isEditMode ? "success.light" : "primary.light"),
                            color: "white",
                            width: 56, height: 56
                        }}>
                            {isLocked ? <LockIcon /> : <CloudUploadIcon />}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color={isLocked ? "text.secondary" : "text.primary"}>
                                {isEditMode ? t('submission.title_update') : t('submission.title_create')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isLocked
                                    ? t('submission.status.locked_description', 'Раунд завершено або не активовано. Редагування неможливе.')
                                    : (isEditMode ? t('submission.subtitle_update') : t('submission.subtitle_create'))
                                }
                            </Typography>
                        </Box>
                    </Box>

                    {isEditMode && !isLocked && (
                        <Tooltip title={t('submission.actions.delete')}>
                            <IconButton color="error" onClick={handleDelete} disabled={actionLoading}>
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Divider sx={{ mb: 4 }} />

                {isLocked && (
                    <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3, borderRadius: "12px" }}>
                        {t('submission.alerts.locked', 'Цей раунд зараз неактивний. Ви можете переглянути подані дані, але не можете їх змінити.')}
                    </Alert>
                )}

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>{successMsg}</Alert>}

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                            <GitHubIcon color={isLocked ? "disabled" : "action"} sx={{ mb: 1.5 }} />
                            <TextField
                                label={t('submission.fields.github')}
                                name="githubLink"
                                fullWidth
                                required
                                value={formData.githubLink}
                                onChange={handleFormChange}
                                disabled={actionLoading || isLocked}
                                variant="standard"
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                            <YouTubeIcon color={isLocked ? "disabled" : "action"} sx={{ mb: 1.5 }} />
                            <TextField
                                label={t('submission.fields.video')}
                                name="videoLink"
                                fullWidth
                                required
                                value={formData.videoLink}
                                onChange={handleFormChange}
                                disabled={actionLoading || isLocked}
                                variant="standard"
                            />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                            <DescriptionIcon color={isLocked ? "disabled" : "action"} sx={{ mt: 2 }} />
                            <TextField
                                label={t('submission.fields.description')}
                                name="description"
                                multiline
                                rows={4}
                                fullWidth
                                value={formData.description}
                                onChange={handleFormChange}
                                disabled={actionLoading || isLocked}
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        sx={{ borderRadius: "12px", px: 3 }}
                    >
                        {isLocked ? t('common.close', 'Закрити') : t('common.cancel')}
                    </Button>

                    {!isLocked && (
                        <Button
                            type="submit"
                            variant="contained"
                            color={isEditMode ? "success" : "primary"}
                            startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? <EditIcon /> : <SendIcon />)}
                            disabled={actionLoading}
                            sx={{
                                px: 4, py: 1.5, borderRadius: "12px", fontWeight: 700,
                                boxShadow: isEditMode
                                    ? "0 4px 14px 0 rgba(46,125,50,0.39)"
                                    : "0 4px 14px 0 rgba(0,118,255,0.39)"
                            }}
                        >
                            {actionLoading ? t('common.loading') : (isEditMode ? t('submission.actions.update') : t('submission.actions.submit'))}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};