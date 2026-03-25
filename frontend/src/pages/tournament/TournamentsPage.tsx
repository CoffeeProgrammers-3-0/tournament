import {type ChangeEvent, useCallback, useEffect, useState} from "react";
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
    Container,
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

    // --- ЛОГІКА ЗАВАНТАЖЕННЯ (Винесена в useCallback) ---
    const fetchTournaments = useCallback(async () => {
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
    }, [page, debouncedSearch, tabValue, statusFilter, isLoggedIn]);

    // Виклик завантаження при зміні параметрів
    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    // --- ЛОГІКА СТВОРЕННЯ ТУРНІРУ ---
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

            // 1. Закриваємо режим створення
            setIsCreating(false);

            // 2. Очищуємо форму
            setFormData({ name: "", description: "", startTournament: "", startRegistration: "", endRegistration: "", maxCountOfTeams: 16, countOfRounds: 4 });

            // 3. ПЕРЕМИКАЄМО ТАБ ТА ФІЛЬТР (щоб адмін побачив новий DRAFT турнір)
            setTabValue(TABS.ADMIN);
            setStatusFilter("DRAFT");
            setPage(1);
            setSearchParams({ tab: TABS.ADMIN.toString() });

            // 4. ПЕРЕЗАВАНТАЖУЄМО ДАНІ
            await fetchTournaments();

        } catch (error) {
            console.error("Create error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ІНШІ ОБРОБНИКИ ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => setPage(1), [debouncedSearch]);

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

    // --- UI РЕНДЕРИНГ (Форма створення) ---
    if (isCreating && isAdmin) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setIsCreating(false)} sx={{ mb: 3 }}>
                    {t("tournaments.admin.backToList")}
                </Button>
                <Paper sx={{ p: 4, borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
                    <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                        {t("tournaments.admin.modal_title")}
                    </Typography>
                    <Divider sx={{ mb: 4, borderStyle: "dashed" }} />
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
                        <Button variant="outlined" sx={{ borderRadius: "12px" }} onClick={() => setIsCreating(false)}>
                            {t("tournaments.admin.cancel")}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ borderRadius: "12px", px: 4, color: "black", fontWeight: 700 }}
                            onClick={handleSubmitCreate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : t("tournaments.admin.submit")}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    // --- UI РЕНДЕРИНГ (Список) ---
    return (
        <Container maxWidth="lg" sx={{ pb: 8, pt: 2 }}>
            <Box sx={{ mb: 6, textAlign: "center", position: "relative" }}>
                <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
                    {t("tournaments.title")}
                </Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400}>
                    {t("tournaments.subtitle")}
                </Typography>
                {isAdmin && tabValue === TABS.ADMIN && (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreating(true)}
                        sx={{
                            position: { md: "absolute" },
                            right: 0,
                            top: "50%",
                            transform: { md: "translateY(-50%)" },
                            borderRadius: "14px",
                            color: "black",
                            fontWeight: 700,
                            px: 3
                        }}
                    >
                        {t("tournaments.admin.create_button")}
                    </Button>
                )}
            </Box>

            {/* Вкладки та Пошук */}
            <Box sx={{ mb: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{ '& .MuiTab-root': { fontWeight: 700, fontSize: "0.95rem" } }}>
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
                    <TextField
                        size="small"
                        placeholder={t("tournaments.search_placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
                            sx: { borderRadius: "12px" }
                        }}
                    />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {tournaments.length > 0 ? (
                        tournaments.map((tournament) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tournament.id}>
                                <Card
                                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                    sx={{
                                        height: "100%",
                                        cursor: "pointer",
                                        borderRadius: "24px",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", borderColor: "primary.light" }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, pr: 1 }}>
                                                {tournament.name}
                                            </Typography>
                                            <Chip
                                                label={t(`tournaments.statuses.${tournament.status}`)}
                                                color={tournament.status === "REGISTRATION" ? "success" : "default"}
                                                size="small"
                                                sx={{ fontWeight: 700, borderRadius: "8px" }}
                                            />
                                        </Box>
                                        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
                                        <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                                            <EventIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                            <Typography variant="body2" fontWeight={500}>
                                                {new Date(tournament.startTournament).toLocaleString(i18n.language === "uk" ? "uk-UA" : "en-US", {
                                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ px: 3, pb: 3 }}>
                                        <Button variant="text" fullWidth sx={{ borderRadius: "12px", fontWeight: 700 }}>
                                            {t("tournaments.card.more_info")}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: "center", py: 12, bgcolor: "#fafafa", borderRadius: "32px" }}>
                                <Typography variant="h6" color="text.secondary" fontWeight={600}>
                                    {t("tournaments.card.no_data")}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="large" />
                </Box>
            )}
        </Container>
    );
};