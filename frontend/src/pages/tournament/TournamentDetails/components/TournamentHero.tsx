import {Box, Button, Chip, Grid, Paper, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {toLocalInput} from "../../../../utils/data.ts";

export const TournamentHero = ({ state, t, navigate }: any) => {
    const { tournamentData, isAdmin, isEditingInfo, setIsEditingInfo, isUserRegistered, tournamentId } = state;
    if (!tournamentData) return null;

    const isRegistrationOpen = tournamentData.status === "REGISTRATION";

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 6 }, borderRadius: "32px", color: "white", mb: 5,
                background: "linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)"
            }}
        >
            <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip label={t(`tournaments.statuses.${tournamentData.status}`)} sx={{ bgcolor: "secondary.main", color: "black", fontWeight: 800 }} />
                        <Chip icon={<CalendarMonthIcon style={{ color: "white" }} />} label={toLocalInput(tournamentData.startTournament)} variant="outlined" sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                    </Box>
                    <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: "2.3rem", md: "3.5rem" } }}>
                        {tournamentData.name}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { md: "flex-end" }, gap: 2 }}>
                    {isAdmin ? (
                        !isEditingInfo && (
                            <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => { setIsEditingInfo(true); state.setTabValue(0); }} sx={{ borderRadius: "14px", fontWeight: 800, color: "black" }}>
                                {t("tournament_details.admin.edit_info")}
                            </Button>
                        )
                    ) : (
                        isRegistrationOpen && (
                            isUserRegistered ? (
                                <Chip icon={<CheckCircleIcon style={{ color: "white" }} />} label={t("tournament_details.header.registered")} sx={{ bgcolor: "success.main", color: "white", p: 3, borderRadius: "16px" }} />
                            ) : (
                                <Button variant="contained" color="secondary" size="large" startIcon={<HowToRegIcon />} onClick={() => navigate(`/tournaments/${tournamentId}/team/create`)} sx={{ borderRadius: "16px", fontWeight: 800, px: 4, py: 2, color: "black" }}>
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