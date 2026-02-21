import {useEffect, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Divider,
    Grid,
    InputAdornment,
    Pagination,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import type {TournamentListResponseDto, TournamentStatus} from "../../entities/tournament/tournament.dto.ts";

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

    // Стейт
    const tabFromUrl = parseInt(searchParams.get("tab") || "0");
    const [tabValue, setTabValue] = useState(tabFromUrl);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        setTabValue(tabFromUrl);
        setPage(1); // Скидаємо сторінку при зміні вкладки
    }, [tabFromUrl]);

    const handleTabChange = (_: any, newValue: number) => {
        setTabValue(newValue);
        setSearchParams({ tab: newValue.toString() });
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

    // Логіка фільтрації та пошуку
    const filteredData = useMemo(() => {
        return MOCK_TOURNAMENTS.filter((t) => {
            const matchesTab =
                tabValue === 0 ? (t.status === "REGISTRATION_OPEN" || t.status === "CREATED") :
                    tabValue === 1 ? (t.status === "IN_PROGRESS") :
                        tabValue === 2 ? (t.status === "FINISHED") : true;

            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesTab && matchesSearch;
        });
    }, [tabValue, searchQuery]);

    // Логіка пагінації
    const count = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    {t("tournaments.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t("tournaments.subtitle")}
                </Typography>
            </Box>

            {/* Controls: Search & Tabs */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 4
            }}>
                <Box sx={{ borderBottom: { xs: 1, md: 0 }, borderColor: "divider", width: { xs: "100%", md: "auto" } }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label={t("tournaments.tabs.available")} sx={{ textTransform: "none", fontWeight: 600 }} />
                        <Tab label={t("tournaments.tabs.my")} sx={{ textTransform: "none", fontWeight: 600 }} />
                        <Tab label={t("tournaments.tabs.history")} sx={{ textTransform: "none", fontWeight: 600 }} />
                    </Tabs>
                </Box>

                <TextField
                    size="small"
                    placeholder={t("tournaments.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    sx={{ width: { xs: "100%", md: 300 }, backgroundColor: "background.paper" }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Grid container spacing={3}>
                {paginatedData.length > 0 ? (
                    paginatedData.map((tournament) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={tournament.id}>
                            <Card sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: "16px",
                                transition: "0.3s",
                                "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                            {tournament.name}
                                        </Typography>
                                        <Chip
                                            label={t(`tournaments.statuses.${tournament.status}`)}
                                            color={getStatusColor(tournament.status)}
                                            size="small"
                                            sx={{ fontWeight: 600, borderRadius: "6px" }}
                                        />
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                                        <EventIcon fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body2" fontWeight={500}>
                                            {t("tournaments.card.start")}: {new Date(tournament.startDate).toLocaleDateString(i18n.language === "uk" ? "uk-UA" : "en-US")}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button variant={tabValue === 0 ? "contained" : "outlined"} fullWidth sx={{ borderRadius: "10px", py: 1, fontWeight: 600, textTransform: "none" }}>
                                        {tabValue === 0 ? t("tournaments.card.registration") : t("tournaments.card.details")}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid size={{xs: 12}} >
                        <Box sx={{ textAlign: "center", py: 10 }}>
                            <Typography variant="h6" color="text.secondary">
                                {t("tournaments.card.no_data")}
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Pagination */}
            {count > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination
                        count={count}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </Box>
            )}
        </Box>
    );
};