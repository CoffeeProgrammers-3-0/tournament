import {Avatar, Box, Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";

export const TeamsTab = ({ state, t, navigate }: any) => {
    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 4 }}>{t("tournament_details.tabs.teams")}</Typography>

            {state.loadingTab ? (
                <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {state.teams.length > 0 ? state.teams.map((team: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={team.id}>
                            <Card onClick={() => navigate(`/teams/${team.id}`)} sx={{ borderRadius: "24px", cursor: "pointer", border: "1px solid #eee", transition: "0.3s", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" } }} elevation={0}>
                                <CardContent sx={{ textAlign: "center", p: 4 }}>
                                    <Avatar sx={{ mx: "auto", mb: 2, bgcolor: "primary.light", color: "primary.main", width: 64, height: 64 }}><GroupsIcon fontSize="large" /></Avatar>
                                    <Typography variant="h6" fontWeight={800}>{team.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{team.email}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )) : (
                        <Box sx={{ textAlign: 'center', width: '100%', py: 8, bgcolor: "#fafafa", borderRadius: "24px" }}>
                            <Typography color="text.secondary" fontWeight={600}>{t("tournament_details.teams.empty")}</Typography>
                        </Box>
                    )}
                </Grid>
            )}
        </Box>
    );
};