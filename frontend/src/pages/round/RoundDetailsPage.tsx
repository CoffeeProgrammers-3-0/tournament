import {useCallback, useEffect, useMemo, useState} from "react";
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
    Grid,
    IconButton,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

import {roundService} from "../../services/impl/RoundService";
// Примітка: Переконайся, що ці сервіси та методи існують у твоєму проєкті
import {teamService} from "../../services/impl/TeamService";
import {categoryService} from "../../services/impl/CategoryService";

import type {RoundFullResponseDto, RoundUpdateRequestDto} from "../../entities/round/round.dto.ts";
import type {CategoryRequestDto, CategoryResponseDto} from "../../entities/category/category.dto.ts";
import type {UserResponseDto} from "../../entities/user/user.dto.ts";
import type {StatisticResponseDto, TeamLeaderboardResponseDto} from "../../entities/team/team.dto.ts";
import {userService} from "../../services/impl/UserService.ts";

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

export const RoundDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isAdmin = Cookies.get("role") === "ADMIN";

    // UI States
    const [loading, setLoading] = useState(true);
    const [loadingTab, setLoadingTab] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    // Модалки
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [juryModalOpen, setJuryModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);

    // Стейт даних
    const [roundData, setRoundData] = useState<RoundFullResponseDto | null>(null);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [jury, setJury] = useState<UserResponseDto[]>([]);
    const [leaderboard, setLeaderboard] = useState<TeamLeaderboardResponseDto[]>([]);

    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");

    // Форми
    const [editFormData, setEditFormData] = useState<RoundUpdateRequestDto>({} as RoundUpdateRequestDto);
    const [newCategoryData, setNewCategoryData] = useState({ title: "", weight: 0.1 });
    const [juryAssignId, setJuryAssignId] = useState(""); // Тимчасово для ID (або можна адаптувати під пошук по email)

    // --- FETCH DATA ---
    const fetchRound = useCallback(async () => {
        if (!id) return;
        try {
            const data = await roundService.getRoundById(Number(id));
            setRoundData(data);
            setEditFormData({
                name: data.name,
                startDate: data.startDate?.substring(0, 16) || "",
                endDate: data.endDate?.substring(0, 16) || "",
                countOfWinners: data.countOfWinners,
                requirements: data.requirements,
                task: data.task
            } as RoundUpdateRequestDto);
        } catch (error) {
            console.error("Failed to fetch round:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchCategories = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            const data = await categoryService.getCategories(Number(id));
            setCategories(data);
        } catch (error) { console.error("Error fetching categories:", error); }
        finally { setLoadingTab(false); }
    }, [id]);

    const fetchJury = useCallback(async () => {
        const roundId = Number(id);
        if (!roundId || isNaN(roundId)) return;

        setLoadingTab(true);
        try {
            const params = {
                page: 0,
                size: 20,
            };

            const response = await userService.getJuriesByRound(params, roundId);

            setJury(response.content);
        } catch (error) {
            console.error("Error fetching jury for round:", error);
            setJury([]);
        } finally {
            setLoadingTab(false);
        }
    }, [id]);

    const fetchLeaderboard = useCallback(async () => {
        if (!id) return;
        setLoadingTab(true);
        try {
            // const data = await teamService.getLeaderboardByRound(Number(id));
            // setLeaderboard(data.sort((a, b) => b.points - a.points));
        } catch (error) { console.error("Error fetching leaderboard:", error); }
        finally { setLoadingTab(false); }
    }, [id]);

    // Initial load
    useEffect(() => {
        fetchRound();
    }, [fetchRound]);

    // Lazy load tabs
    useEffect(() => {
        if (tabValue === 1 && categories.length === 0) fetchCategories();
        if (tabValue === 2 && jury.length === 0) fetchJury();
        if (tabValue === 3 && leaderboard.length === 0) fetchLeaderboard();
    }, [tabValue, categories.length, jury.length, leaderboard.length, fetchCategories, fetchJury, fetchLeaderboard]);


    // --- HANDLERS ---
    const handleSaveUpdate = async () => {
        if (!id || !roundData) return;
        try {
            const payload = {
                ...editFormData,
                startDate: formatToLocalDateTime(editFormData.startDate),
                endDate: formatToLocalDateTime(editFormData.endDate)
            };
            const updated = await roundService.updateRound(Number(id), payload as RoundUpdateRequestDto);
            setRoundData(updated);
            setIsEditingInfo(false);
        } catch (error) {
            console.error("Update round error:", error);
        }
    };

    const handleAddCategory = async () => {
        if (!id) return;
        try {
            await categoryService.createCategory(Number(id), newCategoryData as CategoryRequestDto);
            setCategoryModalOpen(false);
            setNewCategoryData({ title: "", weight: 0.1 });
            fetchCategories(); // Оновлюємо список
        } catch (error) { console.error("Error creating category:", error); }
    };

    const handleAssignJury = async () => {
        if (!id || !juryAssignId) return;
        try {
            await roundService.setJuryToRound(Number(id), Number(juryAssignId));
            setJuryModalOpen(false);
            setJuryAssignId("");
            fetchJury();
        } catch (error) { console.error("Error assigning jury:", error); }
    };

    const handleRemoveJury = async (juryId: number) => {
        if (!id) return;
        try {
            await roundService.removeJuryFromRound(Number(id), juryId);
            fetchJury();
        } catch (error) { console.error("Error removing jury:", error); }
    };

    const handleOpenStats = async (teamId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;
        try {
            const stats = await teamService.getTeamStats(teamId, Number(id));
            setSelectedStats(stats);
            setStatsModalOpen(true);
        } catch (error) {
            console.error("Error fetching team stats:", error);
        }
    };

    // --- COMPUTED DATA FOR STATS ---
    const aggregatedCriteria = useMemo(() => {
        if (!selectedStats || !selectedStats.pointsPerJury) return {};
        const result: Record<string, { total: number, count: number }> = {};

        Object.values(selectedStats.pointsPerJury).forEach(juryScores => {
            if (!juryScores) return;
            Object.entries(juryScores).forEach(([criteria, points]) => {
                if (!result[criteria]) result[criteria] = { total: 0, count: 0 };
                result[criteria].total += points;
                result[criteria].count += 1;
            });
        });
        return result;
    }, [selectedStats]);

    const juryList = selectedStats?.pointsPerJury ? Object.keys(selectedStats.pointsPerJury) : [];
    const criteriaList = Object.keys(aggregatedCriteria);


    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
    if (!roundData) return <Typography sx={{ textAlign: 'center', mt: 5 }}>Round not found</Typography>;

    return (
        <Box sx={{ pb: 8 }}>
            {/* --- HEADER --- */}
            <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "info.dark", color: "white", mb: 4, background: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={800}>{roundData.name}</Typography>
                        <Box sx={{ display: "flex", gap: 2, mt: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <Chip
                                label={t(`rounds.statuses.${roundData.status}`)}
                                sx={{ bgcolor: roundData.status === "ACTIVE" ? "success.main" : "white", color: roundData.status === "ACTIVE" ? "white" : "black", fontWeight: 700 }}
                                size="small"
                            />
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {t("round_details.header.dates")} {roundData.startDate} — {roundData.endDate}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 0.5 }}>
                                <TrophyIcon fontSize="small" /> {t("round_details.header.winners")} {roundData.countOfWinners}
                            </Typography>
                        </Box>
                    </Box>

                    {isAdmin && !isEditingInfo && (
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditingInfo(true)}
                            sx={{ borderRadius: "12px", fontWeight: 700, bgcolor: "white", color: "info.dark", "&:hover": { bgcolor: "#f0f0f0" } }}
                        >
                            {t("round_details.admin.edit_info")}
                        </Button>
                    )}
                </Box>
            </Paper>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 4 }} textColor="inherit" indicatorColor="primary">
                <Tab label={t("round_details.tabs.info")} />
                <Tab label={t("round_details.tabs.categories")} />
                <Tab label={t("round_details.tabs.jury")} />
                <Tab label={t("round_details.tabs.teams")} />
            </Tabs>

            {/* --- TAB 1: INFO --- */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{xs:12, md:8}}>
                        {isEditingInfo ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField fullWidth label="Назва раунду" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <TextField fullWidth type="datetime-local" label="Початок" InputLabelProps={{ shrink: true }} value={editFormData.startDate} onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})} />
                                    <TextField fullWidth type="datetime-local" label="Кінець" InputLabelProps={{ shrink: true }} value={editFormData.endDate} onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})} />
                                </Box>
                                <TextField fullWidth type="number" label="Кількість переможців" value={editFormData.countOfWinners} onChange={(e) => setEditFormData({...editFormData, countOfWinners: Number(e.target.value)})} />
                                <TextField fullWidth multiline rows={4} label={t("round_details.info.task")} value={editFormData.task} onChange={(e) => setEditFormData({...editFormData, task: e.target.value})} />
                                <TextField fullWidth multiline rows={4} label={t("round_details.info.requirements")} value={editFormData.requirements} onChange={(e) => setEditFormData({...editFormData, requirements: e.target.value})} />

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveUpdate}>
                                        {t("round_details.admin.save")}
                                    </Button>
                                    <Button variant="outlined" onClick={() => setIsEditingInfo(false)}>
                                        {t("round_details.admin.cancel")}
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom color="primary.main">{t("round_details.info.task")}</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>
                                        {roundData.task || t("round_details.info.no_info")}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom color="error.main">{t("round_details.info.requirements")}</Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>
                                        {roundData.requirements || t("round_details.info.no_info")}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* --- TAB 2: CATEGORIES & CRITERIA --- */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                        <Typography variant="h5" fontWeight={700}>{t("round_details.tabs.categories")}</Typography>
                        {isAdmin && (
                            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCategoryModalOpen(true)}>
                                {t("round_details.categories.add_category")}
                            </Button>
                        )}
                    </Box>

                    {loadingTab ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
                        <Grid container spacing={3}>
                            {categories.map((cat) => (
                                <Grid size={{xs:12, md:6}} key={cat.id}>
                                    <Card variant="outlined" sx={{ borderRadius: "16px", borderColor: "#e0e0e0" }}>
                                        <CardContent>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>{cat.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t("round_details.categories.weight")} <b>{cat.weight}</b>
                                                    </Typography>
                                                </Box>
                                                {isAdmin && (
                                                    <IconButton size="small" color="error">
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>

                                            <Divider sx={{ mb: 2 }} />

                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                {cat.criteria?.map((crit, idx) => (
                                                    <Chip key={idx} label={crit.text} variant="filled" size="small" sx={{ bgcolor: "grey.200", fontWeight: 500 }} />
                                                ))}
                                                {isAdmin && (
                                                    <Chip
                                                        icon={<AddIcon fontSize="small" />}
                                                        label={t("round_details.categories.add_criteria")}
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => { /* Логіка додавання критерію */ }}
                                                        sx={{ cursor: "pointer", borderStyle: "dashed" }}
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* --- TAB 3: JURY --- */}
            {tabValue === 2 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                        <Typography variant="h5" fontWeight={700}>{t("round_details.tabs.jury")}</Typography>
                        {isAdmin && (
                            <Button variant="outlined" color="primary" startIcon={<PersonAddAlt1Icon />} onClick={() => setJuryModalOpen(true)}>
                                {t("round_details.jury.assign")}
                            </Button>
                        )}
                    </Box>

                    {loadingTab ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
                        <Grid container spacing={2}>
                            {jury.map((j) => (
                                <Grid size={{xs:12, sm:6, md:4}} key={j.id}>
                                    <Card sx={{ borderRadius: "16px", border: "1px solid #eee" }} elevation={0}>
                                        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Avatar sx={{ bgcolor: "warning.light", color: "warning.dark" }}><GavelIcon /></Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={700}>{j.fullName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{j.email}</Typography>
                                                </Box>
                                            </Box>
                                            {isAdmin && (
                                                <Tooltip title="Зняти суддю">
                                                    <IconButton size="small" color="error" onClick={() => handleRemoveJury(j.id)}>
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* --- TAB 4: TEAMS (LEADERBOARD) --- */}
            {tabValue === 3 && (
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>{t("round_details.tabs.teams")}</Typography>

                    {loadingTab ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #eee", borderRadius: "16px" }}>
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell align="center" width="80px"><b>{t("round_details.teams.rank")}</b></TableCell>
                                        <TableCell><b>{t("round_details.teams.team_name")}</b></TableCell>
                                        <TableCell><b>{t("round_details.teams.email")}</b></TableCell>
                                        <TableCell align="right"><b>{t("round_details.teams.points")}</b></TableCell>
                                        <TableCell align="center" width="100px"><b>Дії</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leaderboard.map((team, index) => (
                                        <TableRow key={team.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/teams/${team.id}`)}>
                                            <TableCell align="center">
                                                {index === 0 ? <TrophyIcon sx={{ color: "gold" }} /> :
                                                    index === 1 ? <TrophyIcon sx={{ color: "silver" }} /> :
                                                        index === 2 ? <TrophyIcon sx={{ color: "#cd7f32" }} /> :
                                                            <Typography fontWeight={700} color="text.secondary">{index + 1}</Typography>}
                                            </TableCell>
                                            <TableCell><Typography fontWeight={600}>{team.name}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" color="text.secondary">{team.email}</Typography></TableCell>
                                            <TableCell align="right">
                                                <Chip label={team.points} color={index < roundData.countOfWinners ? "success" : "default"} variant="filled" sx={{ fontWeight: 700 }} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Детальна статистика">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={(e) => handleOpenStats(team.id, e)}
                                                        sx={{ bgcolor: "primary.50" }}
                                                    >
                                                        <InsertChartOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>Немає даних</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* --- MODAL: DETAILED STATISTICS --- */}
            <Dialog open={statsModalOpen} onClose={() => setStatsModalOpen(false)} maxWidth="md" fullWidth>
                {selectedStats && (
                    <>
                        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                            <Typography variant="h6" fontWeight={700}>
                                {t("round_details.stats_modal.title", { teamName: selectedStats.name })}
                            </Typography>
                            <ToggleButtonGroup
                                value={statsViewMode}
                                exclusive
                                onChange={(_, newMode) => newMode && setStatsViewMode(newMode)}
                                size="small"
                                color="primary"
                            >
                                <ToggleButton value="aggregated">
                                    <ViewListIcon fontSize="small" sx={{ mr: 1 }} />
                                    {t("round_details.stats_modal.view_aggregated")}
                                </ToggleButton>
                                <ToggleButton value="detailed">
                                    <ViewModuleIcon fontSize="small" sx={{ mr: 1 }} />
                                    {t("round_details.stats_modal.view_detailed")}
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </DialogTitle>

                        <DialogContent dividers sx={{ p: 0 }}>
                            <TableContainer>
                                <Table size="medium">
                                    <TableHead sx={{ bgcolor: "grey.50" }}>
                                        <TableRow>
                                            <TableCell><b>{t("round_details.stats_modal.criteria")}</b></TableCell>

                                            {statsViewMode === "detailed" && juryList.map(jury => (
                                                <TableCell key={jury} align="center"><b>{jury}</b></TableCell>
                                            ))}

                                            <TableCell align="right" sx={{ bgcolor: "primary.50" }}>
                                                <b>{t("round_details.stats_modal.total")}</b>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {criteriaList.map(criteria => (
                                            <TableRow key={criteria} hover>
                                                <TableCell><Typography fontWeight={600}>{criteria}</Typography></TableCell>

                                                {statsViewMode === "detailed" && juryList.map(jury => (
                                                    <TableCell key={jury} align="center">
                                                        {selectedStats.pointsPerJury?.[jury]?.[criteria] ?? "-"}
                                                    </TableCell>
                                                ))}

                                                <TableCell align="right" sx={{ bgcolor: "primary.50", fontWeight: 700 }}>
                                                    {aggregatedCriteria[criteria]?.total ?? 0}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={statsViewMode === "detailed" ? juryList.length + 1 : 1} align="right">
                                                <Typography fontWeight={800} color="primary">ЗАГАЛЬНИЙ БАЛ:</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ bgcolor: "primary.main", color: "white" }}>
                                                <Typography fontWeight={800} variant="h6">
                                                    {Object.values(aggregatedCriteria).reduce((sum, curr) => sum + curr.total, 0)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setStatsModalOpen(false)} variant="outlined">
                                {t("round_details.stats_modal.close")}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* --- MODAL: CATEGORY --- */}
            <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.category_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField
                        label={t("round_details.admin.category_modal.name")}
                        fullWidth
                        value={newCategoryData.title}
                        onChange={(e) => setNewCategoryData({...newCategoryData, title: e.target.value})}
                    />
                    <TextField
                        label={t("round_details.admin.category_modal.weight")}
                        type="number"
                        inputProps={{ step: "0.1", min: "0", max: "1" }}
                        fullWidth
                        value={newCategoryData.weight}
                        onChange={(e) => setNewCategoryData({...newCategoryData, weight: Number(e.target.value)})}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCategoryModalOpen(false)} color="inherit">{t("round_details.admin.cancel")}</Button>
                    <Button variant="contained" onClick={handleAddCategory} sx={{ fontWeight: 700 }} disabled={!newCategoryData.title}>
                        {t("round_details.admin.category_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- MODAL: ASSIGN JURY --- */}
            <Dialog open={juryModalOpen} onClose={() => setJuryModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.jury_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField
                        label="Введіть ID судді"
                        fullWidth
                        value={juryAssignId}
                        onChange={(e) => setJuryAssignId(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setJuryModalOpen(false)} color="inherit">{t("round_details.admin.cancel")}</Button>
                    <Button variant="contained" onClick={handleAssignJury} sx={{ fontWeight: 700 }} disabled={!juryAssignId}>
                        {t("round_details.admin.jury_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};