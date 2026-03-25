import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SaveIcon from "@mui/icons-material/Save";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// Зверни увагу на правильний імпорт хука (шлях може відрізнятися)
import {useTournamentDetails} from "./useTournamentDetails";
import type {RoundStatus} from "../../entities/round/round.dto.ts";

const ROUND_STATUSES: RoundStatus[] = ['DRAFT', 'ACTIVE', 'SUBMISSION_CLOSED', 'EVALUATED'];

export const TournamentDetailsPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const state = useTournamentDetails();

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString(i18n.language === "uk" ? "uk-UA" : "en-US", {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (state.loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    if (!state.tournamentData) return <Typography align="center" mt={10}>Tournament not found</Typography>;

    return (
        <Container maxWidth="lg" sx={{ pb: 8, pt: 4 }}>
            {/* HERO SECTION */}
            <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: "32px", bgcolor: "primary.main", color: "white", mb: 5, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)" }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label={t(`tournaments.statuses.${state.tournamentData.status}`)} sx={{ bgcolor: "secondary.main", color: "black", fontWeight: 800, px: 1 }} />
                            <Chip icon={<CalendarMonthIcon style={{ color: "white", fontSize: "16px" }} />} label={formatDate(state.tournamentData.startTournament)} variant="outlined" sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                        </Box>
                        <Typography variant="h2" fontWeight={800} sx={{ letterSpacing: "-0.03em", mb: 2 }}>{state.tournamentData.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { md: "flex-end" } }}>
                        {state.isAdmin ? (
                            !state.isEditingInfo && <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => state.setIsEditingInfo(true)} sx={{ borderRadius: "14px", fontWeight: 800, px: 4, py: 1.5, color: "black" }}>{t("tournament_details.admin.edit_info")}</Button>
                        ) : (
                            state.isLoggedIn && state.tournamentData.status === "REGISTRATION" && (
                                state.isUserRegistered
                                    ? <Chip icon={<CheckCircleIcon style={{ color: "white" }} />} label={t("tournament_details.header.registered")} sx={{ bgcolor: "success.main", color: "white", fontWeight: 700, p: 3, fontSize: "1rem", borderRadius: "16px" }} />
                                    : <Button variant="contained" color="secondary" size="large" startIcon={<HowToRegIcon />} onClick={() => navigate(`/tournaments/${state.tournamentId}/team/create`)} sx={{ borderRadius: "16px", fontWeight: 800, px: 5, py: 2, color: "black", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>{t("tournament_details.header.register_btn")}</Button>
                            )
                        )}
                    </Grid>
                </Grid>
            </Paper>

            <Tabs value={state.tabValue} onChange={(_, v) => state.setTabValue(v)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { fontWeight: 700, fontSize: "1rem" } }}>
                {['info', 'rounds', 'teams'].map((label, idx) => <Tab key={idx} label={t(`tournament_details.tabs.${label}`)} />)}
            </Tabs>

            <Box sx={{ mt: 2 }}>
                {state.tabValue === 0 && <InfoTab state={state} formatDate={formatDate} t={t} />}
                {state.tabValue === 1 && <RoundsTab state={state} formatDate={formatDate} t={t} navigate={navigate} />}
                {state.tabValue === 2 && <TeamsTab state={state} t={t} navigate={navigate} />}
            </Box>

            {/* CREATE ROUND DIALOG */}
            <Dialog open={state.roundModalOpen} onClose={() => state.setRoundModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800, fontSize: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {t("tournament_details.admin.create_modal.title")}
                    <IconButton onClick={() => state.setRoundModalOpen(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                    <TextField label={t("tournament_details.admin.create_modal.name")} name="name" value={state.roundFormData.name} onChange={state.handleRoundFormChange} fullWidth />
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label={t("tournament_details.admin.create_modal.start")} name="startDate" type="datetime-local" value={state.roundFormData.startDate} onChange={state.handleRoundFormChange} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label={t("tournament_details.admin.create_modal.end")} name="endDate" type="datetime-local" value={state.roundFormData.endDate} onChange={state.handleRoundFormChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Box>
                    <TextField label={t("tournament_details.admin.create_modal.winners")} name="countOfWinners" type="number" value={state.roundFormData.countOfWinners} onChange={state.handleRoundFormChange} fullWidth />
                    <TextField label={t("tournament_details.admin.create_modal.task")} name="task" value={state.roundFormData.task} onChange={state.handleRoundFormChange} multiline rows={4} fullWidth placeholder={t("tournament_details.admin.create_modal.name_placeholder")} />
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => state.setRoundModalOpen(false)} sx={{ fontWeight: 700, px: 3 }}>{t("common.cancel")}</Button>
                    <Button variant="contained" color="secondary" onClick={state.handleCreateRound} sx={{ fontWeight: 800, borderRadius: "12px", px: 4, color: "black" }} disabled={state.isCreatingRound}>
                        {state.isCreatingRound ? <CircularProgress size={24} /> : t("tournament_details.admin.create_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TournamentDetailsPage;

// --- SUB-COMPONENTS (Щоб файл залишався читабельним) ---

const InfoTab = ({ state, formatDate, t }: any) => (
    <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
            {state.isEditingInfo ? (
                <Paper sx={{ p: 4, borderRadius: "24px", border: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField fullWidth label={t("tournaments.admin.fields.name")} value={state.editFormData.name} onChange={(e) => state.setEditFormData({ ...state.editFormData, name: e.target.value })} />
                        <TextField fullWidth multiline rows={6} label={t("tournaments.admin.fields.description")} value={state.editFormData.description} onChange={(e) => state.setEditFormData({ ...state.editFormData, description: e.target.value })} />

                        {state.canEditFullInfo && (
                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, sm: 6}}><TextField fullWidth type="datetime-local" label={t("tournaments.admin.fields.startReg")} InputLabelProps={{ shrink: true }} value={state.editFormData.startRegistration} onChange={(e) => state.setEditFormData({ ...state.editFormData, startRegistration: e.target.value })} /></Grid>
                                <Grid size={{xs: 12, sm: 6}}><TextField fullWidth type="datetime-local" label={t("tournaments.admin.fields.endReg")} InputLabelProps={{ shrink: true }} value={state.editFormData.endRegistration} onChange={(e) => state.setEditFormData({ ...state.editFormData, endRegistration: e.target.value })} /></Grid>
                                <Grid size={{xs: 12, sm: 4}}><TextField fullWidth type="datetime-local" label={t("tournaments.admin.fields.startTournament")} InputLabelProps={{ shrink: true }} value={state.editFormData.startTournament} onChange={(e) => state.setEditFormData({ ...state.editFormData, startTournament: e.target.value })} /></Grid>
                                <Grid size={{xs: 6, sm: 4}}><TextField fullWidth type="number" label={t("tournaments.admin.fields.maxTeams")} value={state.editFormData.maxCountOfTeams} onChange={(e) => state.setEditFormData({ ...state.editFormData, maxCountOfTeams: Number(e.target.value) })} /></Grid>
                                <Grid size={{xs: 6, sm: 4}}><TextField fullWidth type="number" label={t("tournaments.admin.fields.rounds")} value={state.editFormData.countOfRounds} onChange={(e) => state.setEditFormData({ ...state.editFormData, countOfRounds: Number(e.target.value) })} /></Grid>
                            </Grid>
                        )}
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={state.handleSaveUpdate} sx={{ borderRadius: "12px", px: 4 }}>{t("common.save")}</Button>
                            <Button variant="outlined" size="large" onClick={() => state.setIsEditingInfo(false)} sx={{ borderRadius: "12px" }}>{t("common.cancel")}</Button>
                        </Box>
                    </Box>
                </Paper>
            ) : (
                <Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom>{t("tournament_details.tabs.info")}</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8, color: "text.primary" }}>
                        {state.tournamentData.description || t("tournament_details.info.no_description")}
                    </Typography>
                </Box>
            )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: "24px", p: 1, border: "1px solid #f0f0f0" }} elevation={0}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase" }}>{t("tournament_details.info.reg_period")}</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>{formatDate(state.tournamentData.startRegistration)} — {formatDate(state.tournamentData.endRegistration)}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary" fontWeight={500}>{t("tournament_details.info.max_teams")}</Typography>
                        <Typography fontWeight={800}>{state.tournamentData.maxCountOfTeams}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary" fontWeight={500}>{t("tournament_details.info.rounds_count")}</Typography>
                        <Typography fontWeight={800}>{state.tournamentData.countOfRounds}</Typography>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    </Grid>
);

const RoundsTab = ({ state, formatDate, t, navigate }: any) => (
    <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center", flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>{t("tournament_details.rounds.title")}</Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select value={state.selectedRoundStatus} onChange={(e) => state.setSelectedRoundStatus(e.target.value as RoundStatus)} sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        {ROUND_STATUSES.filter(s => state.isAdmin || s !== 'DRAFT').map(s => <MenuItem key={s} value={s}>{t(`rounds.statuses.${s}`)}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            {state.isAdmin && <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => state.setRoundModalOpen(true)} sx={{ borderRadius: "12px", fontWeight: 700, color: "black" }}>{t("tournament_details.admin.add_round")}</Button>}
        </Box>
        {state.loadingTab ? <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box> : (
            <Grid container spacing={2}>
                {state.rounds.length > 0 ? state.rounds.map((round: any) => (
                    <Grid size={{ xs: 12 }} key={round.id}>
                        <Card onClick={() => navigate(`/rounds/${round.id}`)} sx={{ borderRadius: "20px", cursor: "pointer", border: "1px solid #eee", transition: "0.3s", "&:hover": { borderColor: "primary.main", transform: "translateX(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" } }} elevation={0}>
                            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <Avatar sx={{ bgcolor: round.status === "ACTIVE" ? "primary.main" : "grey.100", color: round.status === "ACTIVE" ? "white" : "grey.400", width: 56, height: 56 }}><AssignmentIcon /></Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800}>{round.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{formatDate(round.startDate)} — {formatDate(round.endDate)}</Typography>
                                    </Box>
                                </Box>
                                <Chip label={t(`rounds.statuses.${round.status}`)} color={round.status === "ACTIVE" ? "success" : "default"} sx={{ fontWeight: 700, borderRadius: "8px" }} />
                            </CardContent>
                        </Card>
                    </Grid>
                )) : <Box sx={{ textAlign: 'center', width: '100%', py: 8, bgcolor: "#fafafa", borderRadius: "24px" }}><Typography color="text.secondary" fontWeight={600}>{t("tournament_details.rounds.empty")}</Typography></Box>}
            </Grid>
        )}
    </Box>
);

const TeamsTab = ({ state, t, navigate }: any) => (
    <Box>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 4 }}>{t("tournament_details.tabs.teams")}</Typography>
        {state.loadingTab ? <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box> : (
            <Grid container spacing={3}>
                {state.teams.length > 0 ? state.teams.map((team: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
                        <Card onClick={() => navigate(`/teams/${team.id}`)} sx={{ borderRadius: "24px", cursor: "pointer", border: "1px solid #eee", transition: "0.3s", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" } }} elevation={0}>
                            <CardContent sx={{ textAlign: "center", p: 4 }}>
                                <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "primary.light", color: "primary.main", width: 64, height: 64 }}><GroupsIcon fontSize="large" /></Avatar>
                                <Typography variant="h6" fontWeight={800}>{team.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{team.email}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )) : <Box sx={{ textAlign: 'center', width: '100%', py: 8, bgcolor: "#fafafa", borderRadius: "24px" }}><Typography color="text.secondary" fontWeight={600}>{t("tournament_details.teams.empty")}</Typography></Box>}
            </Grid>
        )}
    </Box>
);