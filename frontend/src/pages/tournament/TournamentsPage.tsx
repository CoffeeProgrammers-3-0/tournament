import {type ChangeEvent, useEffect, useMemo, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {
    Box, Button, Card, CardActions, CardContent, Chip, Divider, Grid,
    InputAdornment, MenuItem, Pagination, Paper, Tab, Tabs, TextField, Typography
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type {
    TournamentCreateRequestDto,
    TournamentListResponseDto,
    TournamentStatus
} from "../../entities/tournament/tournament.dto.ts";
import TournamentService from "../../services/tournament/TournamentService.ts";

// TODO: remove when backend is connected
const MOCK_TOURNAMENTS: TournamentListResponseDto[] = [
    { id: 1, name: "Осінній Кубок 2026", startDate: "2026-09-01", startRegistration: "2026-08-01", endRegistration: "2026-08-25", status: "REGISTRATION_OPEN" },
    { id: 2, name: "Кібер-ліга: Сезон 4", startDate: "2026-10-15", startRegistration: "2026-09-15", endRegistration: "2026-10-10", status: "CREATED" },
    { id: 3, name: "Літній Інтенсив", startDate: "2026-01-10", startRegistration: "2025-12-01", endRegistration: "2025-12-31", status: "IN_PROGRESS" },
    { id: 4, name: "Star for Life Championship", startDate: "2025-11-01", startRegistration: "2025-10-01", endRegistration: "2025-10-25", status: "FINISHED" },
];

const ITEMS_PER_PAGE = 6;

export const TournamentsPage = () => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const isLoggedIn = Cookies.get("userId") !== undefined;
    const isAdmin = isLoggedIn && Cookies.get("role") === "ADMIN";

    const [isCreating, setIsCreating] = useState(false);
    const tabFromUrl = parseInt(searchParams.get("tab") || "0");
    const [tabValue, setTabValue] = useState(tabFromUrl);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [page, setPage] = useState(1);

    // TODO: replace MOCK_TOURNAMENTS with API data
    // Use TournamentService based on active tab:
    //   tab 0 → TournamentService.getAvailable(page-1, ITEMS_PER_PAGE)
    //   tab 1 → TournamentService.getMy(page-1, ITEMS_PER_PAGE)
    //   tab 2 → TournamentService.getHistory(page-1, ITEMS_PER_PAGE)
    //   tab 3 → TournamentService.getAll(page-1, ITEMS_PER_PAGE)
    // Response is PaginationListResponseDto<TournamentListResponseDto>
    // Set tournaments from response.content, totalPages from response.totalPages
    const [tournaments] = useState<TournamentListResponseDto[]>(MOCK_TOURNAMENTS);

    const [formData, setFormData] = useState<TournamentCreateRequestDto>({
        name: "", description: "", startDate: "", startRegistration: "",
        endRegistration: "", maxCountOfTeams: 16, countOfRounds: 4
    });

    useEffect(() => {
        if (tabFromUrl === 3 && !isAdmin) {
            setSearchParams({ tab: "0" });
            setTabValue(0);
        } else {
            setTabValue(tabFromUrl);
        }
        setPage(1);
    }, [tabFromUrl, isAdmin]);

    const handleTabChange = (_: unknown, newValue: number) => {
        setTabValue(newValue);
        setSearchParams({ tab: newValue.toString() });
        setStatusFilter("ALL");
        setPage(1);
    };

    const getStatusColor = (status: TournamentStatus) => {
        switch (status) {
            case "REGISTRATION_OPEN": return "success";
            case "IN_PROGRESS": return "warning";
            case "FINISHED": return "default";
            case "REGISTRATION_CLOSED": return "error";
            case "CREATED": return "info";
            default: return "default";
        }
    };

    const filteredData = useMemo(() => {
        return tournaments.filter((tr) => {
            const matchesSearch = tr.name.toLowerCase().includes(searchQuery.toLowerCase());
            if (isAdmin && tabValue === 3) {
                return matchesSearch && (statusFilter === "ALL" || tr.status === statusFilter);
            }
            const matchesTab =
                tabValue === 0 ? (tr.status === "REGISTRATION_OPEN" || tr.status === "CREATED") :
                tabValue === 1 ? tr.status === "IN_PROGRESS" :
                tabValue === 2 ? tr.status === "FINISHED" : true;
            return matchesTab && matchesSearch;
        });
    }, [tabValue, searchQuery, statusFilter, isAdmin, tournaments]);

    const count = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "maxCountOfTeams" || name === "countOfRounds" ? Number(value) : value
        }));
    };

    const handleSubmitCreate = async () => {
        // TODO: replace with API call
        // await TournamentService.create(formData);
        // then refresh tournament list
        console.log("Create tournament:", formData);
        setIsCreating(false);
    };

    if (isCreating && isAdmin) {
        return (
            <Box sx={{ pb: 8, maxWidth: "800px", mx: "auto" }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setIsCreating(false)} sx={{ mb: 3, textTransform: "none" }}>
                    {t("tournaments.admin.backToList")}
                </Button>
                <Paper sx={{ p: 4, borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}>
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                        {t("tournaments.admin.modal_title")}
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12}}>
                            <TextField label={t("tournaments.admin.fields.name")} name="name" fullWidth value={formData.name} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{xs: 12}}>
                            <TextField label={t("tournaments.admin.fields.description")} name="description" multiline rows={4} fullWidth value={formData.description} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{xs: 12, sm: 4}}>
                            <TextField label={t("tournaments.admin.fields.startDate")} name="startDate" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{xs: 12, sm: 4}}>
                            <TextField label={t("tournaments.admin.fields.startReg")} name="startRegistration" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.startRegistration} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{xs: 12, sm: 4}}>
                            <TextField label={t("tournaments.admin.fields.endReg")} name="endRegistration" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.endRegistration} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField label={t("tournaments.admin.fields.maxTeams")} name="maxCountOfTeams" type="number" fullWidth value={formData.maxCountOfTeams} onChange={handleFormChange} />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField label={t("tournaments.admin.fields.rounds")} name="countOfRounds" type="number" fullWidth value={formData.countOfRounds} onChange={handleFormChange} />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={() => setIsCreating(false)}>
                            {t("tournaments.admin.cancel")}
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleSubmitCreate} sx={{ px: 4, fontWeight: 700 }}>
                            {t("tournaments.admin.submit")}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ mb: 4, textAlign: "center", position: "relative" }}>
                <Typography variant="h3" fontWeight={700} gutterBottom color="primary">
                    {t("tournaments.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t("tournaments.subtitle")}
                </Typography>
                {isAdmin && tabValue === 3 && (
                    <Button
                        variant="contained" color="error" startIcon={<AddIcon />}
                        onClick={() => setIsCreating(true)}
                        sx={{ position: { md: "absolute" }, right: 0, top: "50%", transform: { md: "translateY(-50%)" }, mt: { xs: 2, md: 0 }, borderRadius: "20px", fontWeight: 700 }}
                    >
                        {t("tournaments.admin.create_button")}
                    </Button>
                )}
            </Box>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label={t("tournaments.tabs.available")} sx={{ textTransform: "none", fontWeight: 600 }} />
                        {isLoggedIn && <Tab label={t("tournaments.tabs.my")} sx={{ textTransform: "none", fontWeight: 600 }} />}
                        {isLoggedIn && <Tab label={t("tournaments.tabs.history")} sx={{ textTransform: "none", fontWeight: 600 }} />}
                        {isAdmin && <Tab label={t("tournaments.tabs.admin")} sx={{ textTransform: "none", fontWeight: 700, color: "error.main" }} />}
                    </Tabs>
                    <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" } }}>
                        {isAdmin && tabValue === 3 && (
                            <TextField
                                select size="small" value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                sx={{ minWidth: 150 }}
                                InputProps={{ startAdornment: <FilterListIcon sx={{ mr: 1, color: "action.active" }} /> }}
                            >
                                <MenuItem value="ALL">{t("tournaments.all_statuses")}</MenuItem>
                                <MenuItem value="CREATED">{t("tournaments.statuses.CREATED")}</MenuItem>
                                <MenuItem value="REGISTRATION_OPEN">{t("tournaments.statuses.REGISTRATION_OPEN")}</MenuItem>
                                <MenuItem value="IN_PROGRESS">{t("tournaments.statuses.IN_PROGRESS")}</MenuItem>
                                <MenuItem value="FINISHED">{t("tournaments.statuses.FINISHED")}</MenuItem>
                            </TextField>
                        )}
                        <TextField
                            size="small" placeholder={t("tournaments.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            sx={{ width: { xs: "100%", md: 250 } }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                        />
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {paginatedData.length > 0 ? paginatedData.map((tournament) => (
                    <Grid size={{xs: 12, sm: 6, md: 4}} key={tournament.id}>
                        <Card
                            onClick={() => navigate(`/tournaments/${tournament.id}`)}
                            sx={{
                                height: "100%", display: "flex", flexDirection: "column",
                                borderRadius: "16px", cursor: "pointer", border: "1px solid #e0e0e0",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(0,0,0,0.1)", borderColor: "primary.main" }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "flex-start" }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ pr: 1 }}>{tournament.name}</Typography>
                                    <Chip label={t(`tournaments.statuses.${tournament.status}`)} color={getStatusColor(tournament.status)} size="small" sx={{ fontWeight: 600 }} />
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        {t("tournaments.card.start")}: {new Date(tournament.startDate).toLocaleDateString(i18n.language === "uk" ? "uk-UA" : "en-US")}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button variant="outlined" color="primary" fullWidth sx={{ borderRadius: "10px", fontWeight: 600, textTransform: "none" }}>
                                    {t("tournaments.card.more_info")}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                )) : (
                    <Grid size={{xs: 12}}>
                        <Box sx={{ textAlign: "center", py: 10 }}>
                            <Typography variant="h6" color="text.secondary">{t("tournaments.card.no_data")}</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {count > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination count={count} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" size="large" />
                </Box>
            )}
        </Box>
    );
};
