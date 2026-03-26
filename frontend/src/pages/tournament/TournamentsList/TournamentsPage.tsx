import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    InputAdornment,
    MenuItem,
    Pagination,
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
        statusFilter, setStatusFilter, isCreating, setIsCreating,
        isAdmin, isJury, isLoggedIn, fetchTournaments
    } = useTournaments();

    if (isCreating && isAdmin) {
        return (
            <TournamentCreateForm
                onCancel={() => setIsCreating(false)}
                onSuccess={() => {
                    setIsCreating(false);
                    handleTabChange(TABS.ADMIN);
                    setStatusFilter("DRAFT");
                    fetchTournaments();
                }}
            />
        );
    }

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            <Box sx={{ mb: 6, textAlign: "center", position: "relative" }}>
                <Typography variant="h3" fontWeight={800}>{t("tournaments.title")}</Typography>
                <Typography variant="h6" color="text.secondary">{t("tournaments.subtitle")}</Typography>
                {isAdmin && tabValue === TABS.ADMIN && (
                    <Button
                        variant="contained" color="secondary" startIcon={<AddIcon />}
                        onClick={() => setIsCreating(true)}
                        sx={{ position: { md: "absolute" }, right: 0, top: "50%", transform: { md: "translateY(-50%)" }, borderRadius: "14px", color: "black", fontWeight: 700 }}
                    >
                        {t("tournaments.admin.create_button")}
                    </Button>
                )}
            </Box>

            <Box sx={{ mb: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Tabs value={tabValue} onChange={(_, v) => handleTabChange(v)}>
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
                        size="small" placeholder={t("tournaments.search_placeholder")}
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment> }}
                    />
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
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
                            <Box sx={{ textAlign: "center", py: 12, bgcolor: "#fafafa", borderRadius: "32px" }}>
                                <Typography variant="h6" color="text.secondary">{t("tournaments.card.no_data")}</Typography>
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