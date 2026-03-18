import {type ChangeEvent, useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {tournamentService} from "../../services/impl/TournamentService";
import type {
    TournamentCreateRequestDto,
    TournamentListResponseDto,
    TournamentStatus
} from "../../entities/tournament/tournament.dto.ts";

const ITEMS_PER_PAGE = 6;

// Константи для значень вкладок
const TABS = {
    AVAILABLE: 0,
    MY: 1,
    HISTORY: 2,
    ADMIN: 3
};

const formatToLocalDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
};

export const TournamentsPage = () => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const userRole = Cookies.get("role");
    const isAdmin = isLoggedIn && userRole === "ADMIN";
    const isJury = isLoggedIn && userRole === "JURY";

    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ініціалізація вкладки з URL або дефолт
    const queryTab = searchParams.get("tab");
    const initialTab = queryTab !== null ? parseInt(queryTab) : (isJury ? TABS.MY : TABS.AVAILABLE);

    const [tabValue, setTabValue] = useState(initialTab);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("DRAFT");
    const [page, setPage] = useState(1);

    const [formData, setFormData] = useState<TournamentCreateRequestDto>({
        name: "",
        description: "",
        startTournament: "",
        startRegistration: "",
        endRegistration: "",
        maxCountOfTeams: 16,
        countOfRounds: 4
    });

    // 1. Захист та валідація вкладок
    useEffect(() => {
        let activeTab = tabValue;

        if (isJury && tabValue !== TABS.MY) {
            activeTab = TABS.MY;
        } else if (!isAdmin && tabValue === TABS.ADMIN) {
            activeTab = TABS.AVAILABLE;
        } else if (!isLoggedIn && (tabValue === TABS.MY || tabValue === TABS.HISTORY)) {
            activeTab = TABS.AVAILABLE;
        }

        if (activeTab !== tabValue) {
            setTabValue(activeTab);
            setSearchParams({ tab: activeTab.toString() });
        }
    }, [isJury, isAdmin, isLoggedIn, tabValue, setSearchParams]);

    // 2. Дебаунс пошуку
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 3. Завантаження даних
    useEffect(() => {
        const fetchTournaments = async () => {
            setLoading(true);
            try {
                const apiPage = page - 1;
                const baseParams = { page: apiPage, size: ITEMS_PER_PAGE, search: debouncedSearch || undefined };
                let res;

                switch (tabValue) {
                    case TABS.AVAILABLE:
                        res = isLoggedIn
                            ? await tournamentService.getAvailableTournaments(baseParams)
                            : await tournamentService.getAllTournaments({ ...baseParams, status: "REGISTRATION" });
                        break;
                    case TABS.MY:
                        res = await tournamentService.getMyTournaments({ ...baseParams, status: "RUNNING" });
                        break;
                    case TABS.HISTORY:
                        res = await tournamentService.getMyTournaments({ ...baseParams, status: "FINISHED" });
                        break;
                    case TABS.ADMIN:
                        const reqStatus = statusFilter === "ALL" ? undefined : (statusFilter as TournamentStatus);
                        res = await tournamentService.getAllTournaments({ ...baseParams, status: reqStatus });
                        break;
                }

                if (res) {
                    setTournaments(res.content);
                    setTotalPages(res.totalPages);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [tabValue, page, debouncedSearch, statusFilter, isLoggedIn]);

    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setSearchParams({ tab: newValue.toString() });
        setPage(1);
        setStatusFilter("DRAFT");
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ["maxCountOfTeams", "countOfRounds"].includes(name) ? Number(value) : value
        }));
    };

    const handleSubmitCreate = async () => {
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                startTournament: formatToLocalDateTime(formData.startTournament),
                startRegistration: formatToLocalDateTime(formData.startRegistration),
                endRegistration: formatToLocalDateTime(formData.endRegistration),
            };
            await tournamentService.createTournament(payload);
            setIsCreating(false);
            setFormData({ name: "", description: "", startTournament: "", startRegistration: "", endRegistration: "", maxCountOfTeams: 16, countOfRounds: 4 });
            setPage(1);
        } catch (error) {
            console.error("Create error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCreating && isAdmin) {
        return (
            <Box sx={{ pb: 8, maxWidth: "800px", mx: "auto", pt: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setIsCreating(false)} sx={{ mb: 3 }}>
                    {t("tournaments.admin.backToList")}
                </Button>
                <Paper sx={{ p: 4, borderRadius: "16px" }}>
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                        {t("tournaments.admin.modal_title")}
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField label={t("tournaments.admin.fields.name")} name="name" fullWidth value={formData.name} onChange={handleFormChange} required />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label={t("tournaments.admin.fields.description")} name="description" multiline rows={4} fullWidth value={formData.description} onChange={handleFormChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField label={t("tournaments.admin.fields.startTournament")} name="startTournament" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={formData.startTournament} onChange={handleFormChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField label={t("tournaments.admin.fields.startReg")} name="startRegistration" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={formData.startRegistration} onChange={handleFormChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField label={t("tournaments.admin.fields.endReg")} name="endRegistration" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={formData.endRegistration} onChange={handleFormChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label={t("tournaments.admin.fields.maxTeams")} name="maxCountOfTeams" type="number" fullWidth value={formData.maxCountOfTeams} onChange={handleFormChange} required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label={t("tournaments.admin.fields.rounds")} name="countOfRounds" type="number" fullWidth value={formData.countOfRounds} onChange={handleFormChange} required />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" onClick={() => setIsCreating(false)}>{t("tournaments.admin.cancel")}</Button>
                        <Button variant="contained" onClick={handleSubmitCreate} disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : t("tournaments.admin.submit")}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 8, pt: 2 }}>
            <Box sx={{ mb: 4, textAlign: "center", position: "relative" }}>
                <Typography variant="h3" fontWeight={700} color="primary">{t("tournaments.title")}</Typography>
                <Typography variant="body1" color="text.secondary">{t("tournaments.subtitle")}</Typography>
                {isAdmin && tabValue === TABS.ADMIN && (
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setIsCreating(true)}
                            sx={{ position: { md: "absolute" }, right: 0, top: "50%", transform: { md: "translateY(-50%)" }, borderRadius: "20px" }}>
                        {t("tournaments.admin.create_button")}
                    </Button>
                )}
            </Box>

            <Box sx={{ mb: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    {!isJury && <Tab value={TABS.AVAILABLE} label={t("tournaments.tabs.available")} />}
                    {isLoggedIn && <Tab value={TABS.MY} label={t("tournaments.tabs.my")} />}
                    {isLoggedIn && !isJury && <Tab value={TABS.HISTORY} label={t("tournaments.tabs.history")} />}
                    {isAdmin && <Tab value={TABS.ADMIN} label={t("tournaments.tabs.admin")} sx={{ color: "error.main" }} />}
                </Tabs>

                <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" } }}>
                    {isAdmin && tabValue === TABS.ADMIN && (
                        <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
                            <MenuItem value="DRAFT">{t("tournaments.statuses.DRAFT")}</MenuItem>
                            <MenuItem value="REGISTRATION">{t("tournaments.statuses.REGISTRATION")}</MenuItem>
                            <MenuItem value="RUNNING">{t("tournaments.statuses.RUNNING")}</MenuItem>
                            <MenuItem value="FINISHED">{t("tournaments.statuses.FINISHED")}</MenuItem>
                        </TextField>
                    )}
                    <TextField size="small" placeholder={t("tournaments.search_placeholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                               InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {tournaments.length > 0 ? (
                        tournaments.map((tournament) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tournament.id}>
                                <Card onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                      sx={{ height: "100%", cursor: "pointer", borderRadius: "16px", border: "1px solid #e0e0e0", transition: "0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(0,0,0,0.1)" } }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                            <Typography variant="h6" fontWeight={700}>{tournament.name}</Typography>
                                            <Chip label={t(`tournaments.statuses.${tournament.status}`)} color={tournament.status === "REGISTRATION" ? "success" : "default"} size="small" />
                                        </Box>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                                            <EventIcon fontSize="small" sx={{ mr: 1 }} />
                                            <Typography variant="body2">
                                                {new Date(tournament.startTournament).toLocaleString(i18n.language === "uk" ? "uk-UA" : "en-US", {
                                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ p: 2 }}><Button variant="outlined" fullWidth>{t("tournaments.card.more_info")}</Button></CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{ width: "100%", textAlign: "center", py: 10 }}>
                            <Typography color="text.secondary">{t("tournaments.card.no_data")}</Typography>
                        </Box>
                    )}
                </Grid>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
                </Box>
            )}
        </Box>
    );
};