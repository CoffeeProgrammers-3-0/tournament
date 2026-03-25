import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import {userService} from "../../services/impl/UserService";
import {teamService} from "../../services/impl/TeamService";
import {tournamentService} from "../../services/impl/TournamentService";

import type {UserResponseDto} from "../../entities/user/user.dto.ts";
import type {TeamListResponseDto} from "../../entities/team/team.dto.ts";
import type {TournamentListResponseDto} from "../../entities/tournament/tournament.dto.ts";

export const ProfilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserResponseDto | null>(null);
    const [teams, setTeams] = useState<TeamListResponseDto[]>([]);
    const [tournaments, setTournaments] = useState<TournamentListResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Стейт для редагування
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [userData, teamsData, tournamentsData] = await Promise.all([
                    userService.getMyProfile(),
                    teamService.getMyTeams({ page: 0, size: 5 }),
                    tournamentService.getMyTournaments({ page: 0, size: 5, status: 'RUNNING' })
                ]);

                setUser(userData);
                setEditName(userData.fullName); // Ініціалізуємо значення для редагування
                setTeams(teamsData?.content || []);
                setTournaments(tournamentsData?.content || []);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            setIsSaving(true);
            const updatedUser = await userService.updateUser(user.id, { fullName: editName });
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (fullName?: string, email?: string) => {
        if (fullName) return fullName.charAt(0).toUpperCase();
        if (email) return email.charAt(0).toUpperCase();
        return "?";
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
    );

    if (!user) return <Typography variant="h6" align="center" sx={{ mt: 10 }}>{t("profile.error_loading")}</Typography>;

    return (
        <Box sx={{ pb: 8, pt: 2 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
                {t("profile.title")}
            </Typography>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: "20px", textAlign: "center", p: 2, height: "100%" }}>
                        <CardContent>
                            <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: "2.5rem" }}>
                                {getInitials(user.fullName, user.email)}
                            </Avatar>

                            {isEditing ? (
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label={t("profile.fields.full_name")}
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                        >
                                            {t("common.save")}
                                        </Button>
                                        <IconButton onClick={() => { setIsEditing(false); setEditName(user.fullName); }}>
                                            <CloseIcon color="error" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h5" fontWeight={700}>{user.fullName}</Typography>
                                    <Chip label={user.role} color="secondary" size="small" sx={{ mt: 1, fontWeight: 700, px: 1 }} />
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ mt: 4, borderRadius: "10px", textTransform: "none" }}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        {t("profile.buttons.edit")}
                                    </Button>
                                </>
                            )}

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
                        </CardContent>
                    </Card>
                </Grid>

                {/* РЕШТА КОЛОНОК (Teams & Tournaments) залишається без змін */}
                <Grid size={{ xs: 12, md: 4 }}>
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
                                        sx={{ px: 1, py: 1.5, borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" } }}
                                        secondaryAction={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: "grey.100", color: "text.primary" }}>{team.name.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={team.name} primaryTypographyProps={{ fontWeight: 600 }} />
                                    </ListItem>
                                    {index < teams.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                                </Box>
                            ))}
                        </List>
                        {teams.length === 0 && <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_teams")}</Typography>}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <EmojiEventsIcon sx={{ mr: 1.5, color: "warning.main" }} />
                            <Typography variant="h6" fontWeight={700}>{t("profile.tournaments")}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {tournaments.map((tournament) => (
                                <Card key={tournament.id} variant="outlined" onClick={() => navigate(`/tournaments/${tournament.id}`)} sx={{ borderRadius: "12px", cursor: "pointer", "&:hover": { borderColor: "primary.main" } }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>{tournament.name}</Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">{tournament.startTournament ? new Date(tournament.startTournament).toLocaleDateString() : 'TBA'}</Typography>
                                            <Chip label={t(`profile.statuses.${tournament.status}`)} size="small" color={tournament.status === "RUNNING" ? "warning" : "success"} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                            {tournaments.length === 0 && <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_tournaments")}</Typography>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};