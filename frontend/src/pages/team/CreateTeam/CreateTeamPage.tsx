import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Grid,
    MenuItem,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {useCreateTeam} from "./useCreateTeam";
import {TeamMembersForm} from "./components/TeamMembersForm";
import {ErrorMessages} from "../../../components/main/ErrorMessages.tsx";

export const CreateTeamPage = () => {
    const {
        formData, loading, fetchingData, errors, success, limits,
        isLoggedIn, myTeams, selectedTeamId, setSelectedTeamId, isExistingTeam, setIsExistingTeam,
        handleTeamChange, handleUserChange, addUser, removeUser, handleSubmit,
        navigate, t
    } = useCreateTeam();

    const emails = formData.users.map(u => u.email?.toLowerCase().trim()).filter(Boolean);
    const hasDuplicateEmails = new Set(emails).size !== emails.length;

    if (fetchingData) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ pb: 6, pt: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, fontWeight: 700 }}>
                {t("common.back")}
            </Button>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 5 }, borderRadius: "24px" }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
                    {t("team_create.title")}
                </Typography>

                {hasDuplicateEmails && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {t("team_create.errors.duplicate_warning", "Each team member must have a unique email address.")}
                    </Alert>
                )}

                {isLoggedIn && myTeams.length > 0 && (
                    <Box sx={{ mb: 4, mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                            {t("team_create.choose_method")}
                        </Typography>
                        <ToggleButtonGroup
                            color="primary"
                            value={isExistingTeam}
                            exclusive
                            onChange={(_, val) => val !== null && setIsExistingTeam(val)}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton value={false}>{t("team_create.method_new")}</ToggleButton>
                            <ToggleButton value={true}>{t("team_create.method_existing")}</ToggleButton>
                        </ToggleButtonGroup>

                        {isExistingTeam && (
                            <TextField
                                select fullWidth
                                label={t("team_create.fields.select_team")}
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                            >
                                {myTeams.map((team) => (
                                    <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Box>
                )}

                <Divider sx={{ mb: 4 }} />

                <ErrorMessages errors={errors} />
                {success && <Alert severity="success" sx={{ mb: 3 }}>{t("team_create.success")}</Alert>}

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth required label={t("team_create.fields.name")} name="name" value={formData.name} onChange={handleTeamChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth required label={t("team_create.fields.contact_email")} name="email" type="email" value={formData.email} onChange={handleTeamChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label={t("team_create.fields.org_name")} name="organization" value={formData.organization} onChange={handleTeamChange} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label={t("team_create.fields.contact_some")} name="contact" value={formData.contact} onChange={handleTeamChange} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TeamMembersForm
                            users={formData.users}
                            onChange={handleUserChange}
                            onAdd={addUser}
                            onRemove={removeUser}
                            limits={limits}
                            isReadOnlyFirst={isLoggedIn}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading || success}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="submit" variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || success || hasDuplicateEmails}
                    >
                        {loading ? t("team_create.registration") : t("team_create.regis")}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};