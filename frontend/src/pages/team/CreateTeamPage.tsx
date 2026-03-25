import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import {teamService} from "../../services/impl/TeamService";
import type {TeamCreateRequestDto} from "../../entities/team/team.dto.ts";

export const CreateTeamPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {tournamentId} = useParams<{ tournamentId: string }>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Стейт форми, який точно відповідає TeamCreateRequestDto
    const [formData, setFormData] = useState<TeamCreateRequestDto>({
        name: "",
        email: "",
        organization: "",
        contact: "",
        users: [
            {fullName: "", email: "", isLeader: true},
            {fullName: "", email: "", isLeader: false}
        ]
    });

    // Оновлення базових полів команди
    const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    // Оновлення полів конкретного учасника
    const handleUserChange = (idx: number, field: keyof typeof formData.users[0], value: string) => {
        setFormData(prev => {
            const updatedUsers = [...prev.users];
            updatedUsers[idx] = {...updatedUsers[idx], [field]: value};
            return {...prev, users: updatedUsers};
        });
    };

    const addUser = () => {
        setFormData(prev => ({
            ...prev,
            users: [...prev.users, {fullName: "", email: "", isLeader: false}]
        }));

    };

    const removeUser = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            users: prev.users.filter((_, i) => i !== idx)
        }));

    };

    const validate = () => {
        if (tournamentId) {
            setError(t("team_create.choose_tournament"));
            return false;
        }
        if (!formData.name.trim() || !formData.email.trim()) {
            setError(t("team_create.name_needed"));
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError(null);

        try {
            await teamService.createTeam(Number(tournamentId), formData);
            setSuccess(true);

            // Затримка перед редіректом, щоб показати повідомлення про успіх
            setTimeout(() => {
                navigate(tournamentId ? `/tournaments/${tournamentId}` : "/teams");
            }, 2000);

        } catch (err: any) {
            console.error("Помилка створення команди:", err);
            setError(err.response?.data?.message || t("team_create.error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{pb: 8, maxWidth: "800px", mx: "auto"}}>
            <Button
                startIcon={<ArrowBackIcon/>}
                onClick={() => navigate(-1)}
                sx={{mb: 3, textTransform: "none"}}
            >
                {t('common.back', t("team_create.back"))}
            </Button>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{p: {xs: 3, md: 5}, borderRadius: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)"}}
            >
                <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
                    {t("team_create.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
                    {t("team_create.subtitle")}
                </Typography>

                <Divider sx={{mb: 4}}/>

                {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}
                {success && <Alert severity="success" sx={{mb: 3}}>{t("team_create.success")}</Alert>}

                <Grid container spacing={3}>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label={t("team_create.fields.name")}
                            name="name"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={handleTeamChange}
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label={t("team_create.fields.contact_email")}
                            name="email"
                            type="email"
                            fullWidth
                            required
                            value={formData.email}
                            onChange={handleTeamChange}
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label={t("team_create.fields.org_name")}
                            name="organization"
                            fullWidth
                            value={formData.organization}
                            onChange={handleTeamChange}
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField
                            label={t("team_create.fields.contact_some")}
                            name="contact"
                            fullWidth
                            value={formData.contact}
                            onChange={handleTeamChange}
                        />
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <Typography variant="h6" fontWeight={700} sx={{mt: 2, mb: 1}}>
                            {t("team_create.team_members")}
                        </Typography>
                        <Divider/>
                    </Grid>

                    {formData.users.map((user, idx) => (
                        <Grid size={{xs: 12}} key={idx}>
                            <Box sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                                flexWrap: {xs: "wrap", sm: "nowrap"}
                            }}>
                                <TextField
                                    label={idx === 0 ? t("team_create.fields.leaders_name") : t("team_create.fields.members_name") + ` ${idx + 1}`}
                                    fullWidth
                                    required
                                    value={user.fullName}
                                    onChange={e => handleUserChange(idx, "fullName", e.target.value)}
                                />
                                <TextField
                                    label={idx === 0 ? t("team_create.fields.leaders_email") : t("team_create.fields.members_email")+ ` ${idx + 1}`}
                                    type="email"
                                    fullWidth
                                    required
                                    value={user.email}
                                    onChange={e => handleUserChange(idx, "email", e.target.value)}
                                />
                                <Box sx={{display: "flex"}}>
                                    <IconButton
                                        color="error"
                                        onClick={() => removeUser(idx)}
                                    >
                                        <RemoveIcon/>
                                    </IconButton>
                                    {idx === formData.users.length - 1  && (
                                        <IconButton color="primary" onClick={addUser}>
                                            <AddIcon/>
                                        </IconButton>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{mt: 5, display: "flex", justifyContent: "flex-end", gap: 2}}>
                    <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}
                            disabled={loading || success}>
                        Скасувати
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon/>}
                        disabled={loading || success}
                        sx={{px: 4, fontWeight: 700}}
                    >
                        {loading ? t("team_create.registration") : t("team_create.regis")}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};