import {type ChangeEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Alert, Avatar, Box, Button, CircularProgress, Divider, Grid, Paper, TextField, Typography} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

// Імпортуємо ваш сервіс та типи
import {userService} from "../../services/impl/UserService";
import type {UserCreateRequestDto} from "../../entities/user/user.dto.ts";

export const CreateJuryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Стейт форми
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
    });

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const requestDto: UserCreateRequestDto = {
            fullName: formData.fullName,
            email: formData.email
        };

        try {
            await userService.createJury(requestDto);

            setSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (err: any) {
            console.error("Failed to create jury", err);
            setError(err.response?.data?.message || t('create_jury.errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ pb: 8, maxWidth: "700px", mx: "auto" }}>
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
                    overflow: "hidden"
                }}
            >
                {/* Декоративний елемент зверху */}
                <Box sx={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "6px",
                    bgcolor: "primary.main"
                }} />

                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", width: 56, height: 56 }}>
                        <PersonAddAlt1Icon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={800} color="text.primary">
                            {t('create_jury.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('create_jury.subtitle')}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>{t('create_jury.success')}</Alert>}

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label={t('create_jury.fields.full_name')}
                            name="fullName"
                            fullWidth
                            required
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleFormChange}
                            disabled={loading || success}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label={t('create_jury.fields.email')}
                            name="email"
                            type="email"
                            fullWidth
                            required
                            placeholder="jury@example.com"
                            value={formData.email}
                            onChange={handleFormChange}
                            disabled={loading || success}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        disabled={loading || success}
                        sx={{ borderRadius: "12px", px: 3 }}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || success}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: "12px",
                            fontWeight: 700,
                            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)"
                        }}
                    >
                        {loading ? t('create_jury.actions.creating') : t('create_jury.actions.submit')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};