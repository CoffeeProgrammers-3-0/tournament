import {Box, Button, Card, CardActions, CardContent, Chip, Divider, Typography} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

export const TournamentCard = ({ tournament }: { tournament: any }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const dateStr = new Date(tournament.startTournament).toLocaleString(
        i18n.language === "uk" ? "uk-UA" : "en-US",
        { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    );

    return (
        <Card
            onClick={() => navigate(`/tournaments/${tournament.id}`)}
            sx={{
                height: "100%", cursor: "pointer", borderRadius: "24px", border: "1px solid",
                borderColor: "divider", transition: "all 0.3s",
                "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h5" fontWeight={800}>{tournament.name}</Typography>
                    <Chip
                        label={t(`tournaments.statuses.${tournament.status}`)}
                        color={tournament.status === "REGISTRATION" ? "success" : "default"}
                        size="small"
                    />
                </Box>
                <Divider sx={{ my: 2, borderStyle: "dashed" }} />
                <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight={500}>{dateStr}</Typography>
                </Box>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 3 }}>
                <Button variant="text" fullWidth sx={{ fontWeight: 700 }}>
                    {t("tournaments.card.more_info")}
                </Button>
            </CardActions>
        </Card>
    );
};