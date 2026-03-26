import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    InputAdornment,
    Pagination,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {useTeams} from "./useTeams";
import {TeamCard} from "./components/TeamCard";

export const TeamsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        teams, loading, searchQuery, setSearchQuery,
        page, setPage, totalPages, isAdmin, deleteTeam
    } = useTeams();

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            {/* Header Section */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "flex-end" },
                mb: 6, gap: 3
            }}>
                <Box>
                    <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: "-0.02em", mb: 1 }}>
                        {isAdmin ? t("teams.admin_title") : t("teams.title")}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ opacity: 0.8 }}>
                        {t("teams.subtitle")}
                    </Typography>
                </Box>

                {isAdmin && (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/admin/teams/create")}
                        sx={{
                            borderRadius: "14px", px: 4, py: 1.5,
                            fontWeight: 700, color: "black",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
                        }}
                    >
                        {t("teams.actions.create")}
                    </Button>
                )}
            </Box>

            {/* Filter Bar */}
            <Paper elevation={0} sx={{
                mb: 5, p: 2,
                bgcolor: "background.paper",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider",
                display: "flex", alignItems: "center"
            }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder={t("teams.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                            <InputAdornment position="start" sx={{ ml: 1 }}>
                                <SearchIcon color="primary" />
                            </InputAdornment>
                        ),
                        sx: { fontSize: "1.1rem" }
                    }}
                />
            </Paper>

            {/* Content Section */}
            {loading && teams.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 15 }}>
                    <CircularProgress thickness={5} size={60} sx={{ color: "primary.light" }} />
                </Box>
            ) : (
                <>
                    <Grid container spacing={4}>
                        {teams.length > 0 ? (
                            teams.map((team) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
                                    <TeamCard
                                        team={team}
                                        isAdmin={isAdmin}
                                        onDelete={deleteTeam}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{
                                    textAlign: "center", py: 12,
                                    bgcolor: "action.hover",
                                    borderRadius: "40px",
                                    border: "2px dashed",
                                    borderColor: "divider"
                                }}>
                                    <GroupsIcon sx={{ fontSize: 100, color: "text.disabled", mb: 2, opacity: 0.3 }} />
                                    <Typography variant="h5" color="text.secondary" fontWeight={600}>
                                        {t("teams.no_data")}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && teams.length > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, v) => setPage(v)}
                                color="primary"
                                size="large"
                                sx={{
                                    "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: "10px" }
                                }}
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};