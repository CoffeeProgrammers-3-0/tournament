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
    CircularProgress,
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

import {teamService} from "../../services/impl/TeamService"; // Переконайся у правильності шляху
import type {TeamListResponseDto} from "../../entities/team/team.dto.ts";

const ITEMS_PER_PAGE = 6;

export const TeamsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Стейт для даних та UI
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Стейт для пошуку та пагінації
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce для пошуку: оновлює debouncedSearch через 500мс після припинення вводу
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Скидаємо сторінку на першу при новому пошуковому запиті
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Завантаження даних з бекенду
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            // Зверни увагу: якщо твій бекенд використовує 0-індексовані сторінки (як Spring Boot),
            // передаємо `page - 1`. Якщо 1-індексовані, передавай просто `page`.
            const response = await teamService.getAllTeams({
                page: page - 1,
                size: ITEMS_PER_PAGE,
                search: debouncedSearch || undefined
            });

            // Підлаштуй під структуру свого PaginationListResponseDto.
            // Зазвичай дані лежать у response.content або response.items
            const content = (response as any).content ?? (response as any).items ?? [];
            const total = (response as any).totalPages ?? 1;

            setTeams(content);
            setTotalPages(total);
        } catch (error) {
            console.error("Помилка завантаження команд:", error);
            // Можна додати toast/snackbar для сповіщення користувача
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleViewDetails = (id: number) => {
        navigate(`/teams/${id}`);
    };

    return (
        <Box sx={{ pb: 8 }}>
            {/* Хедер сторінки */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
                <Typography variant="h3" fontWeight={700} gutterBottom color="primary">
                    {t("teams.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t("teams.subtitle")}
                </Typography>
            </Box>

            {/* Блок пошуку */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                {loading && <CircularProgress size={24} />}
                <TextField
                    size="small"
                    placeholder={t("teams.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: { xs: "100%", md: 300 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Сітка карток */}
            {loading && teams.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {teams.length > 0 ? (
                        teams.map((team) => (
                            <Grid size={{xs: 12, sm: 6, md: 4}} key={team.id}>
                                <Card
                                    onClick={() => handleViewDetails(team.id)}
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: "16px",
                                        cursor: "pointer",
                                        border: "1px solid #e0e0e0",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                                            borderColor: "primary.main"
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark" }}>
                                                <GroupsIcon />
                                            </Avatar>
                                            <Typography variant="h6" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                                                {team.name}
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
                                            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                                            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                                                {team.email}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            fullWidth
                                            sx={{ borderRadius: "10px", fontWeight: 600, textTransform: "none" }}
                                        >
                                            {t("teams.card.more_info")}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        // Пустий стан
                        <Grid size={{xs: 12}}>
                            <Box sx={{ textAlign: "center", py: 10 }}>
                                <GroupsIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    {t("teams.no_data")}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Пагінація */}
            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </Box>
            )}
        </Box>
    );
};