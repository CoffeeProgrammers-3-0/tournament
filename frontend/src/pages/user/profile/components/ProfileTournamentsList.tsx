import {Box, Button, Card, CardContent, Chip, CircularProgress, Pagination, Paper, Typography} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

interface ProfileTournamentsListProps {
    tournaments: any[];
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    loading: boolean;
}

export const ProfileTournamentsList = ({
                                           tournaments,
                                           page,
                                           totalPages,
                                           onPageChange,
                                           loading
                                       }: ProfileTournamentsListProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        onPageChange(value - 1);
    };

    return (
        <Paper
            sx={{
                borderRadius: "20px",
                p: 3,
                height: "100%",
                border: "1px solid #f0f0f0",
                display: "flex",
                flexDirection: "column"
            }}
            elevation={0}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EmojiEventsIcon sx={{ mr: 1.5, color: "warning.main" }} />
                    <Typography variant="h6" fontWeight={700}>
                        {t("profile.tournaments")}
                    </Typography>
                </Box>

                <Button
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: "10px" }}
                    onClick={() => navigate("/tournaments")}
                >
                    {t("profile.view_all") || "View All"}
                </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, position: "relative" }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, py: 4 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    <>
                        {tournaments.map((tournament) => (
                            <Card
                                key={tournament.id}
                                variant="outlined"
                                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                sx={{
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    "&:hover": { borderColor: "primary.main" }
                                }}
                            >
                                <CardContent sx={{ p: 2, pb: "16px !important" }}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {tournament.name}
                                    </Typography>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, alignItems: "center" }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {tournament.startTournament ? new Date(tournament.startTournament).toLocaleDateString() : 'TBA'}
                                        </Typography>
                                        <Chip
                                            label={t(`profile.statuses.${tournament.status}`)}
                                            size="small"
                                            color={tournament.status === "RUNNING" ? "warning" : "success"}
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}

                        {tournaments.length === 0 && (
                            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                {t("profile.no_tournaments")}
                            </Typography>
                        )}
                    </>
                )}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
                        shape="rounded"
                        disabled={loading}
                    />
                </Box>
            )}
        </Paper>
    );
};