import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Avatar, Box, Card, CardContent, Chip, Grid,
    InputAdornment, Pagination, TextField, Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import type { TournamentListResponseDto } from "../../entities/tournament/tournament.dto.ts";
import TournamentService from "../../services/tournament/TournamentService.ts";

// TODO: remove when backend is connected
const MOCK_JURY_TOURNAMENTS: TournamentListResponseDto[] = [
    { id: 1, name: "Осінній Кубок 2026", startDate: "2026-09-01", startRegistration: "2026-08-01", endRegistration: "2026-08-25", status: "IN_PROGRESS" },
    { id: 3, name: "Літній Інтенсив", startDate: "2026-01-10", startRegistration: "2025-12-01", endRegistration: "2025-12-31", status: "REGISTRATION_OPEN" },
];

const ITEMS_PER_PAGE = 6;

export const JuryTournamentsPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>(MOCK_JURY_TOURNAMENTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        // TODO: replace mock with real API call:
        // TournamentService.getJuryTournaments().then(setTournaments);
    }, []);

    const filtered = useMemo(() =>
        tournaments.filter(tr => tr.name.toLowerCase().includes(searchQuery.toLowerCase())),
        [searchQuery, tournaments]);

    const count = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <Box sx={{ pb: 8 }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <GavelIcon color="primary" sx={{ fontSize: 36 }} />
                    <Typography variant="h3" fontWeight={700} color="primary">{t("jury_tournaments.title")}</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">{t("jury_tournaments.subtitle")}</Typography>
            </Box>

            <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end" }}>
                <TextField
                    size="small" placeholder={t("tournaments.search_placeholder")} value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    sx={{ width: { xs: "100%", md: 280 } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                />
            </Box>

            <Grid container spacing={3}>
                {paginated.length > 0 ? paginated.map((tr) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tr.id}>
                        <Card
                            onClick={() => navigate(`/tournaments/${tr.id}`)}
                            sx={{ borderRadius: "16px", cursor: "pointer", border: "1px solid #e0e0e0", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(0,0,0,0.1)", borderColor: "primary.main" } }}
                            elevation={0}
                        >
                            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark" }}><AssignmentIcon /></Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight={700} noWrap>{tr.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(tr.startDate).toLocaleDateString(i18n.language === "uk" ? "uk-UA" : "en-US")}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={t(`tournaments.statuses.${tr.status}`)} size="small"
                                    color={tr.status === "IN_PROGRESS" ? "warning" : tr.status === "REGISTRATION_OPEN" ? "success" : "default"}
                                    sx={{ fontWeight: 600, flexShrink: 0 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: "center", py: 10 }}>
                            <GavelIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">{t("jury_tournaments.no_data")}</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {count > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination count={count} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" size="large" />
                </Box>
            )}
        </Box>
    );
};
