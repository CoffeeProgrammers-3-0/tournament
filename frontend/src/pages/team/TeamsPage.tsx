import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Pagination,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import Cookies from "js-cookie";

import {teamService} from "../../services/impl/TeamService";
import type {TeamListResponseDto} from "../../entities/team/team.dto.ts";

const ITEMS_PER_PAGE = 6;

export const TeamsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Рольова модель
    const userRole = Cookies.get("userRole") || 'USER';
    const isAdmin = userRole === 'ADMIN';

    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 1. Debounce logic (стандарт для всіх пошуків)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => setPage(1), [debouncedSearch]);

    // 2. Fetch logic з обробкою помилок та ролей
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            // Викликаємо сервіс (тут можна додати логіку: адмін тягне все, юзер - фільтроване)
            const response = await teamService.getAllTeams({
                page: page - 1,
                size: ITEMS_PER_PAGE,
                search: debouncedSearch || undefined
            });

            // Універсальний мапінг пагінації
            const content = (response as any).content ?? (response as any).items ?? [];
            const total = (response as any).totalPages ?? 1;

            setTeams(content);
            setTotalPages(total);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "center", md: "flex-end" },
                mb: 6,
                gap: 2
            }}>
                <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: "-0.02em", mb: 1 }}>
                        {isAdmin ? t("teams.admin_title") : t("teams.title")}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight={400}>
                        {t("teams.subtitle")}
                    </Typography>
                </Box>

                {/* Екшн-кнопка для Адміна (приклад стандарту) */}
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: "12px", px: 4, py: 1.2, fontWeight: 700, color: "black" }}
                        onClick={() => navigate("/admin/teams/create")}
                    >
                        {t("teams.actions.create")}
                    </Button>
                )}
            </Box>

            {/* Filter Bar */}
            <Box sx={{
                mb: 4,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                display: "flex",
                alignItems: "center",
                gap: 2
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t("teams.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "primary.main" }} />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: "14px", bgcolor: "#fcfcfc" }
                    }}
                />
                {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
            </Box>

            {/* Grid Section */}
            {loading && teams.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={3}>
                    {teams.length > 0 ? (
                        teams.map((team) => (
                            <Grid size={{xs: 12, sm: 6, md: 4}} key={team.id}>
                                <Card sx={{
                                    height: "100%",
                                    borderRadius: "24px", // Твій фірмовий стиль
                                    border: "1px solid",
                                    borderColor: "divider",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                                        borderColor: "primary.light"
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                                                <GroupsIcon fontSize="large" />
                                            </Avatar>
                                            {isAdmin && <Chip label="ID: 213" size="small" variant="outlined" />}
                                        </Box>

                                        <Typography variant="h5" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
                                            {team.name}
                                        </Typography>

                                        <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mt: 2 }}>
                                            <EmailIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                            <Typography variant="body2" noWrap>{team.email}</Typography>
                                        </Box>
                                    </CardContent>

                                    <Divider sx={{ borderStyle: "dashed" }} />

                                    <CardActions sx={{ p: 3 }}>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={() => navigate(`/teams/${team.id}`)}
                                            sx={{ borderRadius: "12px", fontWeight: 700, py: 1 }}
                                        >
                                            {t("teams.card.more_info")}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid size={{xs: 12}}>
                            <Box sx={{ textAlign: "center", py: 12, bgcolor: "#fafafa", borderRadius: "32px" }}>
                                <GroupsIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2, opacity: 0.2 }} />
                                <Typography variant="h5" color="text.secondary" fontWeight={600}>
                                    {t("teams.no_data")}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': { borderRadius: "10px", fontWeight: 600 }
                        }}
                    />
                </Box>
            )}
        </Container>
    );
};