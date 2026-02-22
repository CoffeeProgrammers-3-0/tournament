import {useMemo, useState} from "react";
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
import type {RoundFullResponseDto} from "../../entities/round/round.dto.ts";
import type {CategoryResponseDto} from "../../entities/category/category.dto.ts";
import type {UserResponseDto} from "../../entities/user/user.dto.ts";
import type {StatisticResponseDto, TeamLeaderboardResponseDto} from "../../entities/team/team.dto.ts";

import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

// ==== MOCK DATA ====
const MOCK_ROUND: RoundFullResponseDto = {
    id: 1,
    name: "Півфінал: Розробка MVP",
    startDate: "2026-10-01",
    endDate: "2026-10-14",
    countOfWinners: 4,
    requirements: "1. Робочий прототип.\n2. Документація API.\n3. Відкритий репозиторій.",
    task: "Створити мінімально життєздатний продукт (MVP) для вирішення обраної проблеми. Використовувати стек React + Node.js.",
    status: "ACTIVE"
};

const MOCK_CATEGORIES: CategoryResponseDto[] = [
    { id: 1, name: "Технічна реалізація", weight: 0.5, criteria: [{ name: "Чистота коду" }, { name: "Архітектура" }] },
    { id: 2, name: "Дизайн та UX", weight: 0.3, criteria: [{ name: "Зручність інтерфейсу" }, { name: "Відповідність стилістиці" }] },
];

const MOCK_JURY: UserResponseDto[] = [
    { id: 501, fullName: "Олена Суддя", email: "olena@jury.com", role: "JURY" },
    { id: 502, fullName: "Ігор Експерт", email: "igor@jury.com", role: "JURY" },
];

const MOCK_LEADERBOARD: TeamLeaderboardResponseDto[] = [
    { id: 10, name: "Cyber Dragons", email: "contact@cyberdragons.com", points: 85.5 },
    { id: 11, name: "NaVi Junior", email: "navi@gg.com", points: 92.0 },
    { id: 12, name: "Code Breakers", email: "code@breakers.com", points: 78.0 },
].sort((a, b) => b.points - a.points); // Сортуємо за балами

const MOCK_TEAM_STATS: StatisticResponseDto = {
    id: 10,
    name: "Cyber Dragons",
    email: "contact@cyberdragons.com",
    pointsPerJury: {
        "olena@jury.com": {
            "Чистота коду": 9,
            "Архітектура": 8,
            "Зручність інтерфейсу": 10
        },
        "igor@jury.com": {
            "Чистота коду": 7,
            "Архітектура": 9,
            "Зручність інтерфейсу": 8
        }
    }
};

export const RoundDetailsPage = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isAdmin = Cookies.get("role") === "ADMIN";

    const [tabValue, setTabValue] = useState(0);
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    // Модалки
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [juryModalOpen, setJuryModalOpen] = useState(false);

    // Стейт даних
    const [roundData, setRoundData] = useState<RoundFullResponseDto>(MOCK_ROUND);
    const [categories, setCategories] = useState<CategoryResponseDto[]>(MOCK_CATEGORIES);
    const [jury, setJury] = useState<UserResponseDto[]>(MOCK_JURY);
    const [leaderboard, setLeaderboard] = useState<TeamLeaderboardResponseDto[]>(MOCK_LEADERBOARD);

    const handleTabChange = (_: any, newValue: number) => setTabValue(newValue);

    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [selectedStats, setSelectedStats] = useState<StatisticResponseDto | null>(null);
    const [statsViewMode, setStatsViewMode] = useState<"aggregated" | "detailed">("aggregated");

    const handleOpenStats = (teamId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click navigation
        // Here you would fetch the stats by teamId and roundId. Using mock for now:
        setSelectedStats(MOCK_TEAM_STATS);
        setStatsModalOpen(true);
    };

// Helper to calculate aggregated data
    const aggregatedCriteria = useMemo(() => {
        if (!selectedStats) return {};
        const result: Record<string, { total: number, count: number }> = {};

        Object.values(selectedStats.pointsPerJury).forEach(juryScores => {
            Object.entries(juryScores).forEach(([criteria, points]) => {
                if (!result[criteria]) result[criteria] = { total: 0, count: 0 };
                result[criteria].total += points;
                result[criteria].count += 1;
            });
        });
        return result;
    }, [selectedStats]);

// Extract unique jury emails and criteria names for the table headers/rows
    const juryList = selectedStats ? Object.keys(selectedStats.pointsPerJury) : [];
    const criteriaList = Object.keys(aggregatedCriteria);

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

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }} textColor="inherit" indicatorColor="primary">
                <Tab label={t("round_details.tabs.info")} />
                <Tab label={t("round_details.tabs.categories")} />
                <Tab label={t("round_details.tabs.jury")} />
                <Tab label={t("round_details.tabs.teams")} />
            </Tabs>

            {/* --- TAB 1: INFO --- */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{xs: 12, md: 8}}>
                        {isEditingInfo ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField fullWidth label="Назва раунду" value={roundData.name} onChange={(e) => setRoundData({...roundData, name: e.target.value})} />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <TextField fullWidth type="date" label="Початок" InputLabelProps={{ shrink: true }} value={roundData.startDate} onChange={(e) => setRoundData({...roundData, startDate: e.target.value})} />
                                    <TextField fullWidth type="date" label="Кінець" InputLabelProps={{ shrink: true }} value={roundData.endDate} onChange={(e) => setRoundData({...roundData, endDate: e.target.value})} />
                                </Box>
                                <TextField fullWidth type="number" label="Кількість переможців" value={roundData.countOfWinners} onChange={(e) => setRoundData({...roundData, countOfWinners: Number(e.target.value)})} />
                                <TextField fullWidth multiline rows={4} label={t("round_details.info.task")} value={roundData.task} onChange={(e) => setRoundData({...roundData, task: e.target.value})} />
                                <TextField fullWidth multiline rows={4} label={t("round_details.info.requirements")} value={roundData.requirements} onChange={(e) => setRoundData({...roundData, requirements: e.target.value})} />

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button variant="contained" startIcon={<SaveIcon />} onClick={() => setIsEditingInfo(false)}>
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

                    <Grid container spacing={3}>
                        {categories.map((cat) => (
                            <Grid size={{xs: 12, md: 6}} key={cat.id}>
                                <Card variant="outlined" sx={{ borderRadius: "16px", borderColor: "#e0e0e0" }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>{cat.name}</Typography>
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
                                            {cat.criteria.map((crit, idx) => (
                                                <Chip key={idx} label={crit.name} variant="filled" size="small" sx={{ bgcolor: "grey.200", fontWeight: 500 }} />
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

                    <Grid container spacing={2}>
                        {jury.map((j) => (
                            <Grid size={{xs: 12, sm: 6, md: 4}} key={j.id}>
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
                                                <IconButton size="small" color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
                                            </Tooltip>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* --- TAB 4: TEAMS (LEADERBOARD) --- */}
            {tabValue === 3 && (
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>{t("round_details.tabs.teams")}</Typography>
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
                                            {/* ADMIN OR TEAM MEMBER CHECK HERE */}
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
                            </TableBody>
                        </Table>
                    </TableContainer>
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

                                            {/* Columns for Detailed View */}
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

                                                {/* Rows for Detailed View */}
                                                {statsViewMode === "detailed" && juryList.map(jury => (
                                                    <TableCell key={jury} align="center">
                                                        {selectedStats.pointsPerJury[jury]?.[criteria] ?? "-"}
                                                    </TableCell>
                                                ))}

                                                {/* Total/Sum per criteria */}
                                                <TableCell align="right" sx={{ bgcolor: "primary.50", fontWeight: 700 }}>
                                                    {aggregatedCriteria[criteria].total}
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

            {/* --- MODALS --- */}

            {/* Modal: Category */}
            <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.category_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField label={t("round_details.admin.category_modal.name")} fullWidth />
                    <TextField label={t("round_details.admin.category_modal.weight")} type="number" inputProps={{ step: "0.1", min: "0", max: "1" }} fullWidth />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setCategoryModalOpen(false)} color="inherit">{t("round_details.admin.cancel")}</Button>
                    <Button variant="contained" onClick={() => setCategoryModalOpen(false)} sx={{ fontWeight: 700 }}>
                        {t("round_details.admin.category_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Assign Jury */}
            <Dialog open={juryModalOpen} onClose={() => setJuryModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("round_details.admin.jury_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField label={t("round_details.admin.jury_modal.email_search")} fullWidth placeholder="Введіть email існуючого судді..." />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setJuryModalOpen(false)} color="inherit">{t("round_details.admin.cancel")}</Button>
                    <Button variant="contained" onClick={() => setJuryModalOpen(false)} sx={{ fontWeight: 700 }}>
                        {t("round_details.admin.jury_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};