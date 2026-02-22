import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
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
import type {TeamListResponseDto} from "../../entities/team/team.dto.ts";

// Мокові дані
const MOCK_TEAMS: TeamListResponseDto[] = [
    { id: 1, name: "NaVi Junior", email: "contact@navi.gg" },
    { id: 2, name: "Cyber Cats", email: "meow@cybercats.ua" },
    { id: 3, name: "SFL Masters", email: "masters@starforlife.org.ua" },
    { id: 4, name: "Lviv Lions", email: "lions@lviv.ua" },
    { id: 5, name: "Kyiv Ninjas", email: "ninjas@kyiv.ua" },
    { id: 6, name: "Odesa Pirates", email: "pirates@odesa.ua" },
    { id: 7, name: "Dnipro Rockets", email: "rockets@dnipro.ua" },
];

const ITEMS_PER_PAGE = 6;

export const TeamsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Стейт для пошуку та пагінації
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    // Фільтрація
    const filteredData = useMemo(() => {
        return MOCK_TEAMS.filter((team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // Пагінація
    const count = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
            <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-end" }}>
                <TextField
                    size="small"
                    placeholder={t("teams.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1); // Скидаємо на першу сторінку при новому пошуку
                    }}
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
            <Grid container spacing={3}>
                {paginatedData.length > 0 ? (
                    paginatedData.map((team) => (
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

            {/* Пагінація */}
            {count > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination
                        count={count}
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