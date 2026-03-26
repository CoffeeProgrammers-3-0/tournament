import {type ChangeEvent, useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    InputAdornment,
    Pagination,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import EmailIcon from "@mui/icons-material/Email";
import SaveIcon from "@mui/icons-material/Save";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupsIcon from "@mui/icons-material/Groups";

// Твої імпорти (перевір шляхи)
import {userService} from "../../services/impl/UserService";
import type {UserCreateRequestDto, UserResponseDto} from "../../entities/user/user.dto.ts";

export const JuryManagementPage = () => {
    const { t } = useTranslation();
    const [tabValue, setTabValue] = useState(0);

    return (
        <Container maxWidth="lg" sx={{ py: 3, pb: 10 }}>
            {/* --- UNIFIED HEADER SECTION --- */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 5 },
                    borderRadius: "32px",
                    mb: 4,
                    background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                    color: "white",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
                        {t("juries.management_title", "Управління журі")}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 500 }}>
                        {t("juries.management_subtitle", "Переглядайте список експертів та додавайте нових членів журі для оцінювання турнірів на платформі.")}
                    </Typography>
                </Box>
                {/* Декоративна іконка на фоні */}
                <GavelIcon sx={{
                    position: "absolute", right: -20, bottom: -40, fontSize: 250,
                    opacity: 0.1, transform: "rotate(-15deg)"
                }} />
            </Paper>

            {/* --- TABS --- */}
            <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                    mb: 4,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': { fontWeight: 700, fontSize: "1rem", textTransform: "none" }
                }}
            >
                <Tab icon={<GroupsIcon sx={{ mr: 1 }} />} iconPosition="start" label={t("juries.tabs.list", "Список журі")} />
                <Tab icon={<PersonAddAlt1Icon sx={{ mr: 1 }} />} iconPosition="start" label={t("juries.tabs.create", "Додати журі")} />
            </Tabs>

            {/* --- TAB CONTENT --- */}
            <Box>
                {tabValue === 0 && <JuryListTab t={t} />}
                {tabValue === 1 && <CreateJuryTab t={t} onSuccess={() => setTabValue(0)} />}
            </Box>
        </Container>
    );
};

export default JuryManagementPage;

// ============================================================================
// SUB-COMPONENT: LIST
// ============================================================================

const JuryListTab = ({ t }: { t: any }) => {
    const [juries, setJuries] = useState<UserResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 12;

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = useState<string>("");

    // Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch
    const fetchJuries = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                query: debouncedQuery || undefined,
                page: page - 1,
                size: pageSize
            };
            const response = await userService.getJuries(params);
            setJuries(response.content);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Error fetching juries:", error);
            setJuries([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, page]);

    useEffect(() => {
        fetchJuries();
    }, [fetchJuries]);

    const getInitials = (name: string) => {
        if (!name) return "J";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <Box>
            {/* Search Bar */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
                <TextField
                    variant="outlined"
                    placeholder={t("juries.search_placeholder", "Пошук за ім'ям...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        width: { xs: "100%", md: "350px" },
                        backgroundColor: "white",
                        borderRadius: "16px",
                        "& .MuiOutlinedInput-root": { borderRadius: "16px" }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                        ),
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : juries.length > 0 ? (
                <>
                    <Grid container spacing={3}>
                        {juries.map((jury) => (
                            <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={jury.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: "24px", border: "1px solid #eee", height: "100%",
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                        textAlign: "center", p: 3, transition: "all 0.3s ease",
                                        "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 24px rgba(0,0,0,0.06)", borderColor: "primary.main" }
                                    }}
                                >
                                    <Avatar sx={{ width: 80, height: 80, mb: 2, fontSize: "2rem", fontWeight: 700, bgcolor: "secondary.light", color: "secondary.dark" }}>
                                        {getInitials(jury.fullName)}
                                    </Avatar>
                                    <CardContent sx={{ p: 0, width: "100%" }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{jury.fullName}</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2, color: "text.secondary" }}>
                                            <EmailIcon fontSize="small" />
                                            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{jury.email}</Typography>
                                        </Box>
                                        <Chip icon={<GavelIcon fontSize="small" />} label={t("roles.JURY", "Журі")} size="small" sx={{ bgcolor: "primary.50", color: "primary.dark", fontWeight: 700, borderRadius: "8px" }} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                            <Pagination
                                count={totalPages} page={page} onChange={(_, value) => setPage(value)}
                                color="primary" size="large"
                                sx={{ "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: "12px" } }}
                            />
                        </Box>
                    )}
                </>
            ) : (
                <Box sx={{ textAlign: "center", py: 10, bgcolor: "#fafafa", borderRadius: "32px" }}>
                    <GavelIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                        {searchQuery ? t("juries.no_results", "За вашим запитом нікого не знайдено.") : t("juries.empty", "Список журі наразі порожній.")}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

// ============================================================================
// SUB-COMPONENT: CREATE
// ============================================================================

const CreateJuryTab = ({ t, onSuccess }: { t: any, onSuccess: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({ fullName: "", email: "" });

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const requestDto: UserCreateRequestDto = { fullName: formData.fullName, email: formData.email };
            await userService.createJury(requestDto);
            setSuccess(true);

            // Чекаємо трохи, щоб показати повідомлення про успіх, потім перемикаємо вкладку
            setTimeout(() => {
                setSuccess(false);
                setFormData({ fullName: "", email: "" });
                onSuccess();
            }, 1500);

        } catch (err: any) {
            console.error("Failed to create jury", err);
            setError(err.response?.data?.message || t('create_jury.errors.generic', 'Сталася помилка при створенні журі'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: "700px", mx: "auto", pt: 2 }}>
            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={0}
                sx={{
                    p: { xs: 4, md: 6 },
                    borderRadius: "24px",
                    border: "1px solid #eee",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", bgcolor: "secondary.main" }} />

                <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.dark", width: 56, height: 56 }}>
                        <PersonAddAlt1Icon />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={800} color="text.primary">
                            {t('create_jury.title', 'Додати нового члена журі')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('create_jury.subtitle', 'Введіть дані експерта, щоб надати йому доступ до платформи.')}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>{t('create_jury.success', 'Журі успішно створено!')}</Alert>}

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label={t('create_jury.fields.full_name', "Повне ім'я")}
                            name="fullName" fullWidth required placeholder="Іван Франко"
                            value={formData.fullName} onChange={handleFormChange}
                            disabled={loading || success}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label={t('create_jury.fields.email', 'Email')}
                            name="email" type="email" fullWidth required placeholder="jury@example.com"
                            value={formData.email} onChange={handleFormChange}
                            disabled={loading || success}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading || success}
                        sx={{ px: 4, py: 1.5, borderRadius: "12px", fontWeight: 700, boxShadow: "0 4px 14px 0 rgba(0,0,0,0.15)" }}
                    >
                        {loading ? t('create_jury.actions.creating', 'Створення...') : t('create_jury.actions.submit', 'Створити')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};