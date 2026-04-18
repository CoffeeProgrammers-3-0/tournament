import {Box, Button, Chip, Grid, Paper, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from "@mui/icons-material/Delete";
import {toLocalInput} from "../../../../utils/data.ts"; // Додано

export const TournamentHero = ({ state, t, navigate }: any) => {
    const {
        tournamentData,
        isAdmin,
        isEditingInfo,
        setIsEditingInfo,
        isUserRegistered,
        tournamentId,
        handleDeleteTournament,
        setTabValue
    } = state;

    if (!tournamentData) return null;

    const isRegistrationOpen = tournamentData.status === "REGISTRATION";
    const isDraft = tournamentData.status === "DRAFT";

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 6 },
                borderRadius: "32px",
                bgcolor: "primary.main",
                color: "white",
                mb: 5,
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)"
            }}
        >
            <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                        <Chip
                            label={t(`tournaments.statuses.${tournamentData.status}`)}
                            sx={{ bgcolor: "secondary.main", color: "black", fontWeight: 800, px: 1 }}
                        />
                        <Chip
                            icon={<CalendarMonthIcon style={{ color: "white", fontSize: "16px" }} />}
                            label={toLocalInput(tournamentData.startTournament)}
                            variant="outlined"
                            sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                        />
                    </Box>
                    <Typography variant="h2" fontWeight={800} sx={{ letterSpacing: "-0.03em", mb: 2, fontSize: { xs: "2.5rem", md: "3.75rem" } }}>
                        {tournamentData.name}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { md: "flex-end" }, gap: 2 }}>
                    {isAdmin ? (
                        <>
                            {/* Кнопка ВИДАЛЕННЯ (тільки для DRAFT) */}
                            {isDraft && !isEditingInfo && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteTournament}
                                    sx={{
                                        borderRadius: "14px",
                                        fontWeight: 800,
                                        px: 3,
                                        py: 1.5,
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        color: 'white',
                                        '&:hover': {
                                            borderColor: 'error.main',
                                            bgcolor: 'rgba(211, 47, 47, 0.1)'
                                        }
                                    }}
                                >
                                    {t("common.delete", "Видалити")}
                                </Button>
                            )}

                            {!isEditingInfo && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<EditIcon />}
                                    onClick={() => {setIsEditingInfo(true); setTabValue(0)}}
                                    sx={{ borderRadius: "14px", fontWeight: 800, px: 3, py: 1.5, color: "black" }}
                                >
                                    {t("tournament_details.admin.edit_info")}
                                </Button>
                            )}
                        </>
                    ) : (
                        /* 2. ЛОГІКА ДЛЯ ЗВИЧАЙНИХ ЮЗЕРІВ ТА ГОСТЕЙ */
                        isRegistrationOpen && (
                            isUserRegistered ? (
                                <Chip
                                    icon={<CheckCircleIcon style={{ color: "white" }} />}
                                    label={t("tournament_details.header.registered")}
                                    sx={{
                                        bgcolor: "success.main",
                                        color: "white",
                                        fontWeight: 700,
                                        p: 3,
                                        fontSize: "1rem",
                                        borderRadius: "16px"
                                    }}
                                />
                            ) : (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    startIcon={<HowToRegIcon />}
                                    onClick={() => navigate(`/tournaments/${tournamentId}/team/create`)}
                                    sx={{
                                        borderRadius: "16px",
                                        fontWeight: 800,
                                        px: 4,
                                        py: 2,
                                        color: "black",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    {t("tournament_details.header.register_btn")}
                                </Button>
                            )
                        )
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
};