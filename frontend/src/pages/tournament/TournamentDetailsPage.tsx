import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {
    Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, Grid, Paper, Tab, Tabs,
    TextField, Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SaveIcon from "@mui/icons-material/Save";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { TeamListResponseDto } from "../../entities/team/team.dto.ts";
import type { RoundListResponseDto, RoundCreateRequestDto } from "../../entities/round/round.dto.ts";
import type { TournamentFullResponseDto, TournamentUpdateRequestDto } from "../../entities/tournament/tournament.dto.ts";
import TournamentService from "../../services/tournament/TournamentService.ts";
import RoundService from "../../services/round/RoundService.ts";

// TODO: remove when backend is connected
const MOCK_TOURNAMENTS: TournamentFullResponseDto[] = [
    {
        id: 1, name: "Осінній Кубок 2026",
        description: "Головна подія сезону для професійних команд.",
        startDate: "2026-09-01", startRegistration: "2026-08-01", endRegistration: "2026-08-25",
        maxCountOfTeams: 32, countOfRounds: 5, status: "REGISTRATION_OPEN"
    },
    {
        id: 3, name: "Літній Інтенсив",
        description: "Інтенсивний літній турнір для молодих команд.",
        startDate: "2026-01-10", startRegistration: "2025-12-01", endRegistration: "2025-12-31",
        maxCountOfTeams: 16, countOfRounds: 3, status: "IN_PROGRESS"
    },
];
const MOCK_ROUNDS: Record<number, RoundListResponseDto[]> = {
    1: [
        { id: 1, name: "Кваліфікація", startDate: "2026-09-01", endDate: "2026-09-03", status: "FINISHED" },
        { id: 2, name: "1/8 Фіналу", startDate: "2026-09-05", endDate: "2026-09-07", status: "ACTIVE" },
        { id: 3, name: "Чвертьфінал", startDate: "2026-09-10", endDate: "2026-09-12", status: "CREATED" },
    ],
    3: [
        { id: 4, name: "Відбір", startDate: "2026-01-10", endDate: "2026-01-12", status: "FINISHED" },
        { id: 5, name: "Фінал", startDate: "2026-01-15", endDate: "2026-01-17", status: "ACTIVE" },
    ],
};
const MOCK_TEAMS: TeamListResponseDto[] = [
    { id: 1, name: "NaVi Junior", email: "navi@gg.com" },
    { id: 2, name: "Cyber Cats", email: "cats@meow.com" },
];

export const TournamentDetailsPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [tournamentData, setTournamentData] = useState<TournamentFullResponseDto>(MOCK_TOURNAMENTS[0]);
    const [rounds, setRounds] = useState<RoundListResponseDto[]>([]);
    // TODO: replace with API — TeamService.getByTournament(id) when endpoint exists
    const [teams] = useState<TeamListResponseDto[]>(MOCK_TEAMS);

    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [roundModalOpen, setRoundModalOpen] = useState(false);
    const [roundForm, setRoundForm] = useState<RoundCreateRequestDto>({
        name: "", startDate: "", endDate: "", countOfWinners: 4, requirements: "", task: ""
    });

    useEffect(() => {
        if (!id) return;
        // TODO: replace mock with real API calls:
        // TournamentService.getById(Number(id)).then(setTournamentData);
        // RoundService.getByTournament(Number(id)).then(setRounds);
        // TournamentService.isRegistered(Number(id)).then(setIsUserRegistered);
        const found = MOCK_TOURNAMENTS.find(t => t.id === Number(id));
        if (found) setTournamentData(found);
        setRounds(MOCK_ROUNDS[Number(id)] ?? []);
    }, [id]);

    const handleTabChange = (_: unknown, newValue: number) => setTabValue(newValue);

    const visibleRounds = useMemo(() => {
        if (isAdmin) return rounds;
        return rounds.filter(r => r.status === "ACTIVE" || r.status === "FINISHED");
    }, [rounds, isAdmin]);

    const handleSaveInfo = async () => {
        // TODO: TournamentService.update(Number(id), tournamentData as TournamentUpdateRequestDto)
        setIsEditingInfo(false);
    };

    const handleRegister = async () => {
        // TODO: TournamentService.register(Number(id))
        setIsUserRegistered(true);
    };

    const handleCreateRound = async () => {
        // TODO: RoundService.create(Number(id), roundForm).then(newRound => setRounds(prev => [...prev, newRound]))
        setRoundModalOpen(false);
    };

    return (
        <Box sx={{ pb: 8 }}>
            {/* --- HEADER --- */}
            <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "primary.main", color: "white", mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={800}>{tournamentData.name}</Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip label={t(`tournaments.statuses.${tournamentData.status}`)} sx={{ bgcolor: "white", fontWeight: 700 }} size="small" />
                            <Chip label={`${t("tournament_details.header.startDate")} ${tournamentData.startDate}`} variant="outlined" sx={{ color: "white", borderColor: "white" }} size="small" />
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {isAdmin ? (
                            !isEditingInfo && (
                                <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => setIsEditingInfo(true)} sx={{ borderRadius: "12px", fontWeight: 700 }}>
                                    {t("tournament_details.admin.edit_info")}
                                </Button>
                            )
                        ) : (
                            isLoggedIn && tournamentData.status === "REGISTRATION_OPEN" && (
                                isUserRegistered ? (
                                    <Chip icon={<CheckCircleIcon style={{ color: "white" }} />} label={t("tournament_details.header.registered")} sx={{ bgcolor: "success.main", color: "white", fontWeight: 700, p: 2, height: "45px", borderRadius: "12px" }} />
                                ) : (
                                    <Button variant="contained" color="secondary" size="large" startIcon={<HowToRegIcon />} onClick={handleRegister} sx={{ borderRadius: "12px", fontWeight: 700, px: 4 }}>
                                        {t("tournament_details.header.register_btn")}
                                    </Button>
                                )
                            )
                        )}
                    </Box>
                </Box>
            </Paper>

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label={t("tournament_details.tabs.info")} />
                <Tab label={t("tournament_details.tabs.rounds")} />
                <Tab label={t("tournament_details.tabs.teams")} />
            </Tabs>

            {/* --- TAB 1: INFO --- */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{xs: 12, md: 8}}>
                        {isEditingInfo ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField fullWidth label={t("tournaments.admin.fields.name")} value={tournamentData.name} onChange={(e) => setTournamentData({...tournamentData, name: e.target.value})} />
                                <TextField fullWidth multiline rows={4} label={t("tournaments.admin.fields.description")} value={tournamentData.description} onChange={(e) => setTournamentData({...tournamentData, description: e.target.value})} />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveInfo}>
                                        {t("tournament_details.admin.save")}
                                    </Button>
                                    <Button variant="outlined" onClick={() => setIsEditingInfo(false)}>
                                        {t("tournament_details.admin.cancel")}
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>
                                {tournamentData.description || t("tournament_details.info.no_description")}
                            </Typography>
                        )}
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <Card sx={{ borderRadius: "16px", border: "1px solid #eee" }} elevation={0}>
                            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">{t("tournament_details.info.reg_period")}</Typography>
                                    <Typography variant="body2" fontWeight={600}>{tournamentData.startRegistration} — {tournamentData.endRegistration}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2">{t("tournament_details.info.max_teams")}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{tournamentData.maxCountOfTeams}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2">{t("tournament_details.info.rounds_count")}</Typography>
                                    <Typography variant="body2" fontWeight={700}>{tournamentData.countOfRounds}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* --- TAB 2: ROUNDS --- */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                        <Typography variant="h5" fontWeight={700}>{t("tournament_details.rounds.title")}</Typography>
                        {isAdmin && (
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setRoundModalOpen(true)} sx={{ borderRadius: "10px" }}>
                                {t("tournament_details.admin.add_round")}
                            </Button>
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        {visibleRounds.length > 0 ? visibleRounds.map((round) => (
                            <Grid size={{xs: 12}} key={round.id}>
                                <Card onClick={() => navigate(`/rounds/${round.id}`)} sx={{ borderRadius: "12px", cursor: "pointer", border: "1px solid #e0e0e0", transition: "0.2s", "&:hover": { borderColor: "primary.main" } }} elevation={0}>
                                    <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar sx={{ bgcolor: round.status === "ACTIVE" ? "primary.main" : "grey.300" }}><AssignmentIcon /></Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight={600}>{round.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{round.startDate} — {round.endDate}</Typography>
                                            </Box>
                                        </Box>
                                        <Chip label={t(`rounds.statuses.${round.status}`)} color={round.status === "ACTIVE" ? "success" : "default"} size="small" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        )) : (
                            <Box sx={{ width: "100%", textAlign: "center", py: 5 }}>
                                <Typography color="text.secondary">{t("tournament_details.rounds.empty")}</Typography>
                            </Box>
                        )}
                    </Grid>
                </Box>
            )}

            {/* --- TAB 3: TEAMS --- */}
            {tabValue === 2 && (
                <Grid container spacing={2}>
                    {teams.map((team) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={team.id}>
                            <Card onClick={() => navigate(`/teams/${team.id}`)} sx={{ borderRadius: "16px", cursor: "pointer", border: "1px solid #eee", transition: "0.2s", "&:hover": { borderColor: "primary.main" } }} elevation={0}>
                                <CardContent sx={{ textAlign: "center" }}>
                                    <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "secondary.light", color: "secondary.dark" }}><GroupsIcon /></Avatar>
                                    <Typography variant="h6" fontWeight={700}>{team.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{team.email}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* --- MODAL: CREATE ROUND --- */}
            <Dialog open={roundModalOpen} onClose={() => setRoundModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("tournament_details.admin.create_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField label={t("tournament_details.admin.create_modal.name")} fullWidth placeholder={t("tournament_details.admin.create_modal.name_placeholder")} value={roundForm.name} onChange={(e) => setRoundForm({...roundForm, name: e.target.value})} />
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label={t("tournament_details.admin.create_modal.start")} type="date" fullWidth InputLabelProps={{ shrink: true }} value={roundForm.startDate} onChange={(e) => setRoundForm({...roundForm, startDate: e.target.value})} />
                        <TextField label={t("tournament_details.admin.create_modal.end")} type="date" fullWidth InputLabelProps={{ shrink: true }} value={roundForm.endDate} onChange={(e) => setRoundForm({...roundForm, endDate: e.target.value})} />
                    </Box>
                    <TextField label={t("tournament_details.admin.create_modal.winners")} type="number" fullWidth value={roundForm.countOfWinners} onChange={(e) => setRoundForm({...roundForm, countOfWinners: Number(e.target.value)})} />
                    <TextField label={t("tournament_details.admin.create_modal.task")} multiline rows={4} fullWidth value={roundForm.task} onChange={(e) => setRoundForm({...roundForm, task: e.target.value})} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRoundModalOpen(false)} color="inherit">{t("tournament_details.admin.cancel")}</Button>
                    <Button variant="contained" onClick={handleCreateRound} sx={{ fontWeight: 700 }}>
                        {t("tournament_details.admin.create_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
