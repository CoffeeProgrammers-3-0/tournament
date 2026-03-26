import {Box, Card, CardContent, Chip, Paper, Typography} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

export const ProfileTournamentsList = ({ tournaments }: { tournaments: any[] }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <EmojiEventsIcon sx={{ mr: 1.5, color: "warning.main" }} />
                <Typography variant="h6" fontWeight={700}>{t("profile.tournaments")}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {tournaments.map((tournament) => (
                    <Card
                        key={tournament.id}
                        variant="outlined"
                        onClick={() => navigate(`/tournaments/${tournament.id}`)}
                        sx={{ borderRadius: "12px", cursor: "pointer", "&:hover": { borderColor: "primary.main" } }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700}>{tournament.name}</Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {tournament.startTournament ? new Date(tournament.startTournament).toLocaleDateString() : 'TBA'}
                                </Typography>
                                <Chip
                                    label={t(`profile.statuses.${tournament.status}`)}
                                    size="small"
                                    color={tournament.status === "RUNNING" ? "warning" : "success"}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                ))}
                {tournaments.length === 0 && (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_tournaments")}</Typography>
                )}
            </Box>
        </Paper>
    );
};