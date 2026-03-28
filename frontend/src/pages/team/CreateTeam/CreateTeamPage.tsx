import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {useCreateTeam} from "./useCreateTeam";
import {TeamMembersForm} from "./components/TeamMembersForm";
import {ErrorMessages} from "../../../components/main/ErrorMessages.tsx";

export const CreateTeamPage = () => {
    const {
        formData, loading, fetchingTournament, errors, success, limits,
        handleTeamChange, handleUserChange, addUser, removeUser, handleSubmit,
        navigate, t
    } = useCreateTeam();

    if (fetchingTournament) {
        return <CircularProgress sx={{ display: "block", mx: "auto", mt: 10 }} />;
    }

    return (
        <Container maxWidth="md" sx={{ pb:6, pt: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 700 }}>
                {t("common.back")}
            </Button>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 5 }, borderRadius: "24px" }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>{t("team_create.title")}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{t("team_create.subtitle")}</Typography>

                <Divider sx={{ mb: 4 }} />

                <ErrorMessages errors={errors} />
                {success && <Alert severity="success" sx={{ mb: 3 }}>{t("team_create.success")}</Alert>}

                <Grid container spacing={3}>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField fullWidth required label={t("team_create.fields.name")} name="name" value={formData.name} onChange={handleTeamChange} />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField fullWidth required label={t("team_create.fields.contact_email")} name="email" type="email" value={formData.email} onChange={handleTeamChange} />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField fullWidth label={t("team_create.fields.org_name")} name="organization" value={formData.organization} onChange={handleTeamChange} />
                    </Grid>
                    <Grid size={{xs: 12, sm: 6}}>
                        <TextField fullWidth label={t("team_create.fields.contact_some")} name="contact" value={formData.contact} onChange={handleTeamChange} />
                    </Grid>

                    <Grid size={{xs: 12}}>
                        <TeamMembersForm
                            users={formData.users}
                            onChange={handleUserChange}
                            onAdd={addUser}
                            onRemove={removeUser}
                            limits={limits}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading || success}>{t("common.cancel")}</Button>
                    <Button
                        type="submit" variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || success}
                    >
                        {loading ? t("team_create.registration") : t("team_create.regis")}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};