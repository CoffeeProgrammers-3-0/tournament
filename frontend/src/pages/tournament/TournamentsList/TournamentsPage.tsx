import {
    Box,
    Button,
    CircularProgress,
    Container,
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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {useTranslation} from "react-i18next";
import {TABS, useTournaments} from "./useTournaments";
import {TournamentCard} from "./components/TournamentCard";
import {TournamentCreateForm} from "./components/TournamentCreateForm";

export const TournamentsPage = () => {
    const { t } = useTranslation();
    const {
        tournaments, totalPages, loading, page, setPage,
        tabValue, handleTabChange, searchQuery, setSearchQuery,
        filter, setFilter, isCreating, setIsCreating,
        isAdmin, isLoggedIn
    } = useTournaments();

    if (isCreating && isAdmin) {
        return (
            <TournamentCreateForm
                onCancel={() => setIsCreating(false)}
                onSuccess={() => {
                    setIsCreating(false);
                    handleTabChange(TABS.ADMIN);
                    setFilter("DRAFT");
                }}
            />
        );
    }

    // Доступні фільтри для користувача (використовуємо старі ключі перекладу з табів)
    const userFilters = isLoggedIn
        ? [
            { value: "AVAILABLE", label: t("tournaments.tabs.available") },
            { value: "REGISTERED", label: t("tournaments.tabs.my_registed") },
            { value: "ACTIVE", label: t("tournaments.tabs.my") },
            { value: "HISTORY", label: t("tournaments.tabs.history") }
        ]
        : [
            { value: "AVAILABLE", label: t("tournaments.tabs.available") }
        ];

    const adminFilters = ["ALL", "DRAFT", "REGISTRATION", "RUNNING", "FINISHED"];

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            <Box sx={{ mb: 6, textAlign: "center", position: "relative" }}>
                <Typography variant="h3" fontWeight={800}>{t("tournaments.title")}</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>
                    {t("tournaments.subtitle")}
                </Typography>

                {isAdmin && tabValue === TABS.ADMIN && (
                    <Button
                        variant="contained" color="secondary" startIcon={<AddIcon />}
                        onClick={() => setIsCreating(true)}
                        sx={{
                            position: { md: "absolute" }, right: 0, top: "50%",
                            transform: { md: "translateY(-50%)" }, borderRadius: "14px",
                            color: "black", fontWeight: 700, px: 3
                        }}
                    >
                        {t("tournaments.admin.create_button")}
                    </Button>
                )}
            </Box>

            <Box sx={{
                mb: 4, display: "flex", flexDirection: { xs: "column", md: "row" },
                alignItems: "center", justifyContent: "space-between", gap: 2,
                bgcolor: "background.paper", p: 1, borderRadius: "20px", border: "1px solid #eee"
            }}>

                {/* Показуємо вкладки ТІЛЬКИ для адміна */}
                {isAdmin ? (
                    <Tabs value={tabValue} onChange={(_, v) => handleTabChange(v)} sx={{ minHeight: 48 }}>
                        {!isAdmin ? <Tab value={TABS.MAIN} label={t("tournaments.tabs.available")} /> :
                        <Tab value={TABS.ADMIN} label={t("tournaments.tabs.admin")} sx={{ color: "error.main", fontWeight: 700 }} />}
                    </Tabs>
                ) : (
                    // Заглушка для звичайного користувача, щоб зберегти Flex-вирівнювання
                    <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2 }}>
                        {t("tournaments.title")}
                    </Typography>
                )}

                <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" }, px: 1 }}>
                    <TextField
                        select size="small" value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        sx={{ minWidth: 160 }}
                    >
                        {tabValue === TABS.ADMIN
                            ? adminFilters.map(f => (
                                <MenuItem key={f} value={f}>{t(`tournaments.statuses.${f}`)}</MenuItem>
                            ))
                            : userFilters.map(f => (
                                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                            ))
                        }
                    </TextField>

                    <TextField
                        size="small" placeholder={t("tournaments.search_placeholder")}
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ bgcolor: "white", borderRadius: "8px" }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>
                        }}
                    />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 15 }}><CircularProgress color="secondary" /></Box>
            ) : (
                <Grid container spacing={3}>
                    {tournaments.length > 0 ? (
                        tournaments.map(t => (
                            <Grid size={{xs:12, sm: 6, md: 4}} key={t.id}>
                                <TournamentCard tournament={t} />
                            </Grid>
                        ))
                    ) : (
                        <Grid size={{xs:12}}>
                            <Paper sx={{ textAlign: "center", py: 12, bgcolor: "#fafafa", borderRadius: "32px", border: "2px dashed #eee" }} elevation={0}>
                                <Typography variant="h6" color="text.secondary">{t("tournaments.card.no_data")}</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="secondary" size="large" />
                </Box>
            )}
        </Container>
    );
};