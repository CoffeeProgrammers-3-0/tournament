import {type ChangeEvent, useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputLabel,
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

import {tournamentService} from "../../services/impl/TournamentService";
import {roundService} from "../../services/impl/RoundService";
import {teamService} from "../../services/impl/TeamService";

import type {RoundCreateRequestDto, RoundListResponseDto, RoundStatus} from "../../entities/round/round.dto.ts";
import type {TournamentFullResponseDto, TournamentUpdateRequestDto} from "../../entities/tournament/tournament.dto.ts";
import type {TeamListResponseDto} from "../../entities/team/team.dto.ts";

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

const ROUND_STATUSES: RoundStatus[] = ['DRAFT', 'ACTIVE', 'SUBMISSION_CLOSED', 'EVALUATED'];

export const TournamentDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const isAdmin = Cookies.get("role") === "ADMIN";

    // UI States
    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [roundModalOpen, setRoundModalOpen] = useState(false);
    const [isCreatingRound, setIsCreatingRound] = useState(false);

    // Data States
    const [tournamentData, setTournamentData] = useState<TournamentFullResponseDto | null>(null);
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [rounds, setRounds] = useState<RoundListResponseDto[]>([]);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);

    // Filters
    const [selectedRoundStatus, setSelectedRoundStatus] = useState<RoundStatus>('ACTIVE');

    // Forms
    const [editFormData, setEditFormData] = useState<TournamentUpdateRequestDto>({
        name: "",
        description: "",
        startRegistration: "",
        endRegistration: "",
        startTournament: "",
        maxCountOfTeams: 0,
        countOfRounds: 0
    } as TournamentUpdateRequestDto);

    const [roundFormData, setRoundFormData] = useState<RoundCreateRequestDto>({
        name: "", startDate: "", endDate: "", countOfWinners: 1, requirements: "", task: ""
    });

    // Дозволяємо редагувати все, якщо статус CREATED (реєстрація ще не почалась)
    const canEditFullInfo = isAdmin && tournamentData?.status === "DRAFT";

    // --- Data Fetching ---
    const fetchRounds = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const res = await roundService.getRoundsByTournament(Number(id), {
                page: 0, size: 100, status: selectedRoundStatus
            });
            setRounds(res.content);
        } catch (e) { console.error("Rounds fetch error:", e); }
        finally { setLoadingTab(false); }
    }, [id, selectedRoundStatus]);

    const fetchTeams = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const res = await teamService.getTeamsByTournament(Number(id), { page: 0, size: 100 });
            setTeams(res.content);
        } catch (e) { console.error("Teams fetch error:", e); }
        finally { setLoadingTab(false); }
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const init = async () => {
            setLoading(true);
            try {
                const data = await tournamentService.getTournamentById(Number(id));
                setTournamentData(data);

                setEditFormData({
                    name: data.name,
                    description: data.description,
                    startRegistration: data.startRegistration?.substring(0, 16) || "",
                    endRegistration: data.endRegistration?.substring(0, 16) || "",
                    startTournament: data.startTournament?.substring(0, 16) || "",
                    maxCountOfTeams: data.maxCountOfTeams,
                    countOfRounds: data.countOfRounds
                } as TournamentUpdateRequestDto);

                if (isLoggedIn && !isAdmin) {
                    setIsUserRegistered(await teamService.checkIfRegistered(Number(id)));
                }
            } catch (e) { console.error("Init error:", e); }
            finally { setLoading(false); }
        };
        init();
    }, [id, isLoggedIn, isAdmin]);

    useEffect(() => {
        if (tabValue === 1) fetchRounds();
        if (tabValue === 2) fetchTeams();
    }, [tabValue, fetchRounds, fetchTeams]);

    // --- Handlers ---
    const handleSaveUpdate = async () => {
        if (!id || !tournamentData) return;
        try {
            const payload = {
                ...editFormData,
                startRegistration: formatToLocalDateTime(editFormData.startRegistration),
                endRegistration: formatToLocalDateTime(editFormData.endRegistration),
                startTournament: formatToLocalDateTime(editFormData.startTournament),
            };

            const updated = await tournamentService.updateTournament(Number(id), payload as TournamentUpdateRequestDto);
            setTournamentData(updated);
            setIsEditingInfo(false);
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    const handleRoundFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRoundFormData(prev => ({
            ...prev,
            [name]: name === "countOfWinners" ? Number(value) : value
        }));
    };

    const handleCreateRound = async () => {
        if (!id) return;
        setIsCreatingRound(true);
        try {
            await roundService.createRound(Number(id), {
                ...roundFormData,
                startDate: formatToLocalDateTime(roundFormData.startDate),
                endDate: formatToLocalDateTime(roundFormData.endDate)
            });
            setRoundModalOpen(false);
            setRoundFormData({ name: "", startDate: "", endDate: "", countOfWinners: 1, requirements: "", task: "" });
            fetchRounds();
        } catch (e) { console.error("Round creation error:", e); }
        finally { setIsCreatingRound(false); }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleString(i18n.language === "uk" ? "uk-UA" : "en-US", {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    if (!tournamentData) return <Typography sx={{ textAlign: 'center', mt: 5 }}>Tournament not found</Typography>;

    return (
        <Box sx={{ pb: 8 }}>
            {/* --- HEADER --- */}
            <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "primary.main", color: "white", mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={800}>{tournamentData.name}</Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip label={t(`tournaments.statuses.${tournamentData.status}`)} sx={{ bgcolor: "white", fontWeight: 700 }} size="small" />
                            <Chip label={`${t("tournament_details.header.startDate")} ${formatDate(tournamentData.startTournament)}`} variant="outlined" sx={{ color: "white", borderColor: "white" }} size="small" />
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {isAdmin ? (
                            !isEditingInfo && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<EditIcon />}
                                    onClick={() => setIsEditingInfo(true)}
                                    sx={{ borderRadius: "12px", fontWeight: 700 }}
                                >
                                    {t("tournament_details.admin.edit_info")}
                                </Button>
                            )
                        ) : (
                            isLoggedIn && tournamentData.status === "REGISTRATION" && (
                                isUserRegistered ? <Chip icon={<CheckCircleIcon style={{ color: "white" }} />} label={t("tournament_details.header.registered")} sx={{ bgcolor: "success.main", color: "white", fontWeight: 700, p: 2, height: "45px", borderRadius: "12px" }} />
                                    : <Button variant="contained" color="secondary" size="large" startIcon={<HowToRegIcon />} onClick={() => navigate(`/tournaments/${id}/team/create`)} sx={{ borderRadius: "12px", fontWeight: 700, px: 4 }}>{t("tournament_details.header.register_btn")}</Button>
                            )
                        )}
                    </Box>
                </Box>
            </Paper>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
                {['info', 'rounds', 'teams'].map((label, idx) => <Tab key={idx} label={t(`tournament_details.tabs.${label}`)} />)}
            </Tabs>

            {/* --- TAB 1: INFO --- */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{xs: 12, md: 8}}>
                        {isEditingInfo ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label={t("tournament_details.admin.create_modal.name")}
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label={t("tournament_details.admin.create_modal.task")}
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                />

                                {canEditFullInfo && (
                                    <>
                                        <Divider>Дати та ліміти</Divider>
                                        <Grid container spacing={2}>
                                            <Grid size={{xs: 12, sm: 6}}>
                                                <TextField
                                                    fullWidth
                                                    type="datetime-local"
                                                    label="Початок реєстрації"
                                                    InputLabelProps={{ shrink: true }}
                                                    value={editFormData.startRegistration}
                                                    onChange={(e) => setEditFormData({ ...editFormData, startRegistration: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{xs: 12, sm: 6}}>
                                                <TextField
                                                    fullWidth
                                                    type="datetime-local"
                                                    label="Кінець реєстрації"
                                                    InputLabelProps={{ shrink: true }}
                                                    value={editFormData.endRegistration}
                                                    onChange={(e) => setEditFormData({ ...editFormData, endRegistration: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{xs: 12, sm: 6}}>
                                                <TextField
                                                    fullWidth
                                                    type="datetime-local"
                                                    label="Початок турніру"
                                                    InputLabelProps={{ shrink: true }}
                                                    value={editFormData.startTournament}
                                                    onChange={(e) => setEditFormData({ ...editFormData, startTournament: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{xs: 12, sm: 3}}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Макс. команд"
                                                    value={editFormData.maxCountOfTeams}
                                                    onChange={(e) => setEditFormData({ ...editFormData, maxCountOfTeams: Number(e.target.value) })}
                                                />
                                            </Grid>
                                            <Grid size={{xs: 12, sm: 3}}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="К-ть раундів"
                                                    value={editFormData.countOfRounds}
                                                    onChange={(e) => setEditFormData({ ...editFormData, countOfRounds: Number(e.target.value) })}
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveUpdate}>{t("tournament_details.admin.save")}</Button>
                                    <Button variant="outlined" onClick={() => setIsEditingInfo(false)}>{t("tournament_details.admin.cancel")}</Button>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>{tournamentData.description}</Typography>
                        )}
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <Card sx={{ borderRadius: "16px", border: "1px solid #eee" }} elevation={0}>
                            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">{t("tournament_details.info.reg_period")}</Typography>
                                    <Typography variant="body2" fontWeight={600}>{formatDate(tournamentData.startRegistration)} — {formatDate(tournamentData.endRegistration)}</Typography>
                                </Box>
                                <Divider />
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">{t("tournament_details.info.max_teams")}</Typography><Typography variant="body2" fontWeight={700}>{tournamentData.maxCountOfTeams}</Typography></Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="body2">{t("tournament_details.info.rounds_count")}</Typography><Typography variant="body2" fontWeight={700}>{tournamentData.countOfRounds}</Typography></Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* --- ТАБИ 2 ТА 3 (Раунди та Команди) ЗАЛИШЕНІ БЕЗ ЗМІН ЯК У ВАШОМУ КОДІ --- */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center", flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography variant="h5" fontWeight={700}>{t("tournament_details.rounds.title")}</Typography>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>{t("rounds.status")}</InputLabel>
                                <Select value={selectedRoundStatus} label={t("rounds.status")} onChange={(e) => setSelectedRoundStatus(e.target.value as RoundStatus)}>
                                    {ROUND_STATUSES.filter(s => isAdmin || s !== 'DRAFT').map(s => (
                                        <MenuItem key={s} value={s}>{t(`rounds.statuses.${s}`)}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        {isAdmin && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setRoundModalOpen(true)} sx={{ borderRadius: "10px" }}>{t("tournament_details.admin.add_round")}</Button>}
                    </Box>

                    {loadingTab ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
                        <Grid container spacing={2}>
                            {rounds.length > 0 ? rounds.map((round) => (
                                <Grid size={{xs: 12}} key={round.id}>
                                    <Card onClick={() => navigate(`/rounds/${round.id}`)} sx={{ borderRadius: "12px", cursor: "pointer", border: "1px solid #e0e0e0", transition: "0.2s", "&:hover": { borderColor: "primary.main" } }} elevation={0}>
                                        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Avatar sx={{ bgcolor: round.status === "ACTIVE" ? "primary.main" : "grey.300" }}><AssignmentIcon /></Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={600}>{round.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{formatDate(round.startDate)} — {formatDate(round.endDate)}</Typography>
                                                </Box>
                                            </Box>
                                            <Chip label={t(`rounds.statuses.${round.status}`)} color={round.status === "ACTIVE" ? "success" : "default"} size="small" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )) : <Typography sx={{ textAlign: 'center', width: '100%', py: 5, color: 'text.secondary' }}>{t("tournament_details.rounds.empty")}</Typography>}
                        </Grid>
                    )}
                </Box>
            )}

            {tabValue === 2 && (
                <Box>
                    {loadingTab ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
                        <Grid container spacing={2}>
                            {teams.length > 0 ? teams.map((team) => (
                                <Grid size={{xs: 12, sm: 6, md:4}} key={team.id}>
                                    <Card onClick={() => navigate(`/teams/${team.id}`)} sx={{ borderRadius: "16px", cursor: "pointer", border: "1px solid #eee", transition: "0.2s", "&:hover": { borderColor: "primary.main", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" } }} elevation={0}>
                                        <CardContent sx={{ textAlign: "center" }}>
                                            <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "secondary.light", color: "secondary.dark" }}><GroupsIcon /></Avatar>
                                            <Typography variant="h6" fontWeight={700}>{team.name}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )) : <Typography sx={{ textAlign: 'center', width: '100%', py: 5, color: 'text.secondary' }}>{t("tournament_details.teams.empty")}</Typography>}
                        </Grid>
                    )}
                </Box>
            )}

            {/* --- MODAL: CREATE ROUND --- */}
            <Dialog open={roundModalOpen} onClose={() => setRoundModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("tournament_details.admin.create_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
                    <TextField label={t("tournament_details.admin.create_modal.name")} name="name" value={roundFormData.name} onChange={handleRoundFormChange} fullWidth />
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField label={t("tournament_details.admin.create_modal.start")} name="startDate" type="datetime-local" value={roundFormData.startDate} onChange={handleRoundFormChange} fullWidth InputLabelProps={{ shrink: true }} />
                        <TextField label={t("tournament_details.admin.create_modal.end")} name="endDate" type="datetime-local" value={roundFormData.endDate} onChange={handleRoundFormChange} fullWidth InputLabelProps={{ shrink: true }} />
                    </Box>
                    <TextField label={t("tournament_details.admin.create_modal.winners")} name="countOfWinners" type="number" value={roundFormData.countOfWinners} onChange={handleRoundFormChange} fullWidth />
                    <TextField label={t("tournament_details.admin.create_modal.requirements")} name="requirements" value={roundFormData.requirements} onChange={handleRoundFormChange} multiline rows={3} fullWidth />
                    <TextField label={t("tournament_details.admin.create_modal.task")} name="task" value={roundFormData.task} onChange={handleRoundFormChange} multiline rows={4} fullWidth />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRoundModalOpen(false)} color="inherit" disabled={isCreatingRound}>{t("tournament_details.admin.cancel")}</Button>
                    <Button variant="contained" onClick={handleCreateRound} sx={{ fontWeight: 700 }} disabled={isCreatingRound}>
                        {isCreatingRound ? <CircularProgress size={24} /> : t("tournament_details.admin.create_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};