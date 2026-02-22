import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom"; // Додано для навігації
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Typography
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const MOCK_USER = { id: 1, fullName: "Олександр Коваленко", email: "alex.kov@example.com", role: "ADMIN" };
const MOCK_TEAMS = [
    { id: 1, name: "NaVi Junior", email: "navi@example.com" },
    { id: 2, name: "Cyber Cats", email: "cats@example.com" }
];
const MOCK_ACTIVE_TOURNAMENTS = [
    { id: 1, name: "Осінній Кубок 2026", startDate: "2026-09-01", status: "REGISTRATION_OPEN" },
    { id: 3, name: "Літній Інтенсив", startDate: "2026-01-10", status: "IN_PROGRESS" }
];

export const ProfilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Box sx={{ pb: 8, pt: 2 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
                {t("profile.title")}
            </Typography>

            <Grid container spacing={4}>
                {/* КОЛОНКА 1: МОЯ ІНФОРМАЦІЯ */}
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ borderRadius: "20px", textAlign: "center", p: 2, height: "100%" }}>
                        <CardContent>
                            <Avatar
                                sx={{ width: 100, height: 100, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: "2.5rem" }}
                            >
                                {MOCK_USER.fullName.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" fontWeight={700}>{MOCK_USER.fullName}</Typography>
                            <Chip
                                label={MOCK_USER.role}
                                color="secondary"
                                size="small"
                                sx={{ mt: 1, fontWeight: 700, px: 1 }}
                            />

                            <Box sx={{ mt: 4, textAlign: "left" }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <EmailIcon sx={{ mr: 2, color: "text.secondary" }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body1" fontWeight={500}>{MOCK_USER.email}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <VerifiedUserIcon sx={{ mr: 2, color: "text.secondary" }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">{t("profile.role")}</Typography>
                                        <Typography variant="body1" fontWeight={500}>{MOCK_USER.role}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Button variant="outlined" fullWidth sx={{ mt: 4, borderRadius: "10px", textTransform: "none" }}>
                                {t("profile.buttons.edit")}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* КОЛОНКА 2: МОЇ КОМАНДИ */}
                <Grid size={{xs: 12, md: 4}}>
                    <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <GroupsIcon sx={{ mr: 1.5, color: "primary.main" }} />
                            <Typography variant="h6" fontWeight={700}>{t("profile.teams")}</Typography>
                        </Box>
                        <List disablePadding>
                            {MOCK_TEAMS.map((team, index) => (
                                <Box key={team.id}>
                                    <ListItem
                                        onClick={() => navigate(`/teams/${team.id}`)} // Навігація до команди
                                        sx={{
                                            px: 1,
                                            py: 1.5,
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                            "&:hover": {
                                                bgcolor: "rgba(0, 0, 0, 0.04)",
                                                "& .MuiTypography-root": { color: "primary.main" }
                                            }
                                        }}
                                        secondaryAction={<ArrowForwardIosIcon sx={{ fontSize: 14, color: "text.disabled" }} />}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: "grey.100", color: "text.primary" }}>{team.name.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={team.name}
                                            primaryTypographyProps={{ fontWeight: 600 }}
                                            secondary={team.email}
                                        />
                                    </ListItem>
                                    {index < MOCK_TEAMS.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                                </Box>
                            ))}
                        </List>
                        {MOCK_TEAMS.length === 0 && (
                            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_teams")}</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* КОЛОНКА 3: АКТИВНІ ТУРНІРИ */}
                <Grid size={{xs: 12, md: 4}}>
                    <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <EmojiEventsIcon sx={{ mr: 1.5, color: "warning.main" }} />
                            <Typography variant="h6" fontWeight={700}>{t("profile.tournaments")}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {MOCK_ACTIVE_TOURNAMENTS.map((tournament) => (
                                <Card
                                    key={tournament.id}
                                    variant="outlined"
                                    onClick={() => navigate(`/tournaments/${tournament.id}`)} // Навігація до турніру
                                    sx={{
                                        borderRadius: "12px",
                                        borderStyle: "dashed",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            bgcolor: "rgba(25, 118, 210, 0.02)",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                        <Typography variant="subtitle1" fontWeight={700}>{tournament.name}</Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(tournament.startDate).toLocaleDateString()}
                                            </Typography>
                                            <Chip
                                                label={tournament.status === "IN_PROGRESS" ? "LIVE" : "OPEN"}
                                                size="small"
                                                color={tournament.status === "IN_PROGRESS" ? "warning" : "success"}
                                                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                            {MOCK_ACTIVE_TOURNAMENTS.length === 0 && (
                                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_tournaments")}</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};