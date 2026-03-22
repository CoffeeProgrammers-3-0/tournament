import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {
    Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
    List, ListItem, ListItemAvatar, ListItemText, Paper, Typography
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import type { UserResponseDto } from "../../entities/user/user.dto.ts";
import type { TeamListResponseDto } from "../../entities/team/team.dto.ts";
import type { TournamentListResponseDto } from "../../entities/tournament/tournament.dto.ts";
import UserService from "../../services/user/UserService.ts";
import TeamService from "../../services/team/TeamService.ts";
import TournamentService from "../../services/tournament/TournamentService.ts";

// TODO: remove when backend is connected
const MOCK_USER: UserResponseDto = { id: 1, fullName: "Олександр Коваленко", email: "alex.kov@example.com", role: "ADMIN" };
const MOCK_TEAMS: TeamListResponseDto[] = [
    { id: 1, name: "NaVi Junior", email: "navi@example.com" },
    { id: 2, name: "Cyber Cats", email: "cats@example.com" }
];
const MOCK_ACTIVE_TOURNAMENTS: TournamentListResponseDto[] = [
    { id: 1, name: "Осінній Кубок 2026", startDate: "2026-09-01", startRegistration: "2026-08-01", endRegistration: "2026-08-25", status: "REGISTRATION_OPEN" },
    { id: 3, name: "Літній Інтенсив", startDate: "2026-01-10", startRegistration: "2025-12-01", endRegistration: "2025-12-31", status: "IN_PROGRESS" }
];

export const ProfilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserResponseDto>(MOCK_USER);
    const [teams, setTeams] = useState<TeamListResponseDto[]>(MOCK_TEAMS);
    const [activeTournaments, setActiveTournaments] = useState<TournamentListResponseDto[]>(MOCK_ACTIVE_TOURNAMENTS);

    useEffect(() => {
        // TODO: replace mock with real API calls:
        // UserService.getMe().then(setUser);
        // TeamService.getMy().then(setTeams);
        // TournamentService.getMy().then(res => setActiveTournaments(res.content));
    }, []);

    const handleEditProfile = () => {
        // TODO: open edit modal or navigate to edit page
        // UserService.update(user.id, { fullName: newName }).then(setUser)
    };

    return (
        <Box sx={{ pb: 8, pt: 2 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 4, textAlign: { xs: "center", md: "left" } }}>
                {t("profile.title")}
            </Typography>

            <Grid container spacing={4}>
                {/* COLUMN 1: USER INFO */}
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{ borderRadius: "20px", textAlign: "center", p: 2, height: "100%" }}>
                        <CardContent>
                            <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: "2.5rem" }}>
                                {user.fullName.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" fontWeight={700}>{user.fullName}</Typography>
                            <Chip label={user.role} color="secondary" size="small" sx={{ mt: 1, fontWeight: 700, px: 1 }} />
                            <Box sx={{ mt: 4, textAlign: "left" }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                    <EmailIcon sx={{ mr: 2, color: "text.secondary" }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Email</Typography>
                                        <Typography variant="body1" fontWeight={500}>{user.email}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <VerifiedUserIcon sx={{ mr: 2, color: "text.secondary" }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">{t("profile.role")}</Typography>
                                        <Typography variant="body1" fontWeight={500}>{user.role}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Button variant="outlined" fullWidth sx={{ mt: 4, borderRadius: "10px", textTransform: "none" }} onClick={handleEditProfile}>
                                {t("profile.buttons.edit")}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* COLUMN 2: MY TEAMS */}
                <Grid size={{xs: 12, md: 4}}>
                    <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <GroupsIcon sx={{ mr: 1.5, color: "primary.main" }} />
                            <Typography variant="h6" fontWeight={700}>{t("profile.teams")}</Typography>
                        </Box>
                        <List disablePadding>
                            {teams.map((team, index) => (
                                <Box key={team.id}>
                                    <ListItem
                                        onClick={() => navigate(`/teams/${team.id}`)}
                                        sx={{ px: 1, py: 1.5, borderRadius: "12px", cursor: "pointer", transition: "background 0.2s", "&:hover": { bgcolor: "rgba(0,0,0,0.04)", "& .MuiTypography-root": { color: "primary.main" } } }}
                                        secondaryAction={<ArrowForwardIosIcon sx={{ fontSize: 14, color: "text.disabled" }} />}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: "grey.100", color: "text.primary" }}>{team.name.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={team.name} primaryTypographyProps={{ fontWeight: 600 }} secondary={team.email} />
                                    </ListItem>
                                    {index < teams.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                                </Box>
                            ))}
                        </List>
                        {teams.length === 0 && (
                            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_teams")}</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* COLUMN 3: ACTIVE TOURNAMENTS */}
                <Grid size={{xs: 12, md: 4}}>
                    <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <EmojiEventsIcon sx={{ mr: 1.5, color: "warning.main" }} />
                            <Typography variant="h6" fontWeight={700}>{t("profile.tournaments")}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {activeTournaments.map((tournament) => (
                                <Card key={tournament.id} variant="outlined" onClick={() => navigate(`/tournaments/${tournament.id}`)}
                                    sx={{ borderRadius: "12px", borderStyle: "dashed", cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: "primary.main", bgcolor: "rgba(25,118,210,0.02)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" } }}
                                >
                                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                        <Typography variant="subtitle1" fontWeight={700}>{tournament.name}</Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(tournament.startDate).toLocaleDateString()}
                                            </Typography>
                                            <Chip
                                                label={tournament.status === "IN_PROGRESS" ? "LIVE" : "OPEN"} size="small"
                                                color={tournament.status === "IN_PROGRESS" ? "warning" : "success"}
                                                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                            {activeTournaments.length === 0 && (
                                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_tournaments")}</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
