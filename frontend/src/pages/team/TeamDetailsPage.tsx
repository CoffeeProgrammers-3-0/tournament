import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Paper,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import StarsIcon from "@mui/icons-material/Stars";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import SaveIcon from "@mui/icons-material/Save";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import type {TeamFullResponseDto} from "../../entities/team/team.dto.ts";
import type {TournamentListResponseDto} from "../../entities/tournament/tournament.dto.ts";


// ==== MOCK DATA ====
const MOCK_TEAM: TeamFullResponseDto = {
    id: 1,
    name: "Cyber Dragons",
    email: "contact@cyberdragons.com",
    organization: "Kyiv Esport Academy",
    contact: "+380 67 123 45 67",
    users: [
        { id: 101, fullName: "Олександр Коваленко", email: "alex@team.com", isLeader: true },
        { id: 102, fullName: "Дмитро Мороз", email: "dima@team.com", isLeader: false },
        { id: 103, fullName: "Анна Петренко", email: "anna@team.com", isLeader: false },
    ]
};

const MOCK_TEAM_TOURNAMENTS: TournamentListResponseDto[] = [
    { id: 1, name: "Осінній Кубок 2026", startDate: "2026-09-01", startRegistration: "2026-08-01", endRegistration: "2026-08-25", status: "REGISTRATION_OPEN" },
    { id: 5, name: "Summer Pro League", startDate: "2025-06-15", startRegistration: "2025-05-01", endRegistration: "2025-05-20", status: "FINISHED" },
];

export const TeamDetailsPage = () => {
    //const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Отримуємо дані про поточного користувача
    const currentUserId = Number(Cookies.get("userId"));
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto>(MOCK_TEAM);

    // Перевірка: чи є користувач лідером ЦІЄЇ команди
    const isTeamLeader = teamData.users.find(u => u.id === currentUserId)?.isLeader;
    const canControl = isAdmin || isTeamLeader;

    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [memberModalOpen, setMemberModalOpen] = useState(false);

    const handleTabChange = (_: any, newValue: number) => setTabValue(newValue);

    const handleDeleteMember = (userId: number) => {
        if (window.confirm(t("team_details.admin.delete_member_confirm"))) {
            setTeamData({
                ...teamData,
                users: teamData.users.filter(u => u.id !== userId)
            });
        }
    };

    const handlePromoteToLeader = (userId: number) => {
        setTeamData({
            ...teamData,
            users: teamData.users.map(u => ({
                ...u,
                isLeader: u.id === userId // Новий лідер тільки один
            }))
        });
    };

    return (
        <Box sx={{ pb: 8 }}>
            {/* --- HEADER --- */}
            <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "secondary.main", color: "white", mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: "white", color: "secondary.main", fontSize: "2rem", fontWeight: 800 }}>
                            {teamData.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h3" fontWeight={800}>{teamData.name}</Typography>
                            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                <Typography variant="body2" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <CorporateFareIcon fontSize="small" /> {teamData.organization}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <AlternateEmailIcon fontSize="small" /> {teamData.email}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {canControl && !isEditing && (
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(true)}
                            sx={{ borderRadius: "12px", fontWeight: 700, bgcolor: "white", color: "secondary.main", "&:hover": { bgcolor: "#f5f5f5" } }}
                        >
                            {t("team_details.admin.edit_info")}
                        </Button>
                    )}
                </Box>
            </Paper>

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }} textColor="secondary" indicatorColor="secondary">
                <Tab label={t("team_details.tabs.info")} />
                <Tab label={t("team_details.tabs.members")} />
                <Tab label={t("team_details.tabs.tournaments")} />
            </Tabs>

            {/* --- TAB 1: INFO --- */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{xs: 12, md: 8}}>
                        {isEditing ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField fullWidth label={t("team_details.info.org_name")} value={teamData.organization} onChange={(e) => setTeamData({...teamData, organization: e.target.value})} />
                                <TextField fullWidth label={t("team_details.info.contact_person")} value={teamData.contact} onChange={(e) => setTeamData({...teamData, contact: e.target.value})} />
                                <TextField fullWidth label={t("team_details.info.email")} value={teamData.email} onChange={(e) => setTeamData({...teamData, email: e.target.value})} />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={() => setIsEditing(false)}>
                                        {t("team_details.admin.save")}
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                                        {t("team_details.admin.cancel")}
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Card variant="outlined" sx={{ borderRadius: "16px", p: 3 }}>
                                <Typography variant="h6" gutterBottom fontWeight={700}>{t("team_details.tabs.info")}</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={3}>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <Typography color="text.secondary" variant="caption">{t("team_details.info.org_name")}</Typography>
                                        <Typography variant="body1" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <CorporateFareIcon color="action" /> {teamData.organization || "—"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <Typography color="text.secondary" variant="caption">{t("team_details.info.contact_person")}</Typography>
                                        <Typography variant="body1" fontWeight={600}>{teamData.contact || "—"}</Typography>
                                    </Grid>
                                    <Grid size={{xs: 12}}>
                                        <Typography color="text.secondary" variant="caption">{t("team_details.info.email")}</Typography>
                                        <Typography variant="body1" fontWeight={600}>{teamData.email}</Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* --- TAB 2: MEMBERS (З КЕРУВАННЯМ) --- */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
                        <Typography variant="h5" fontWeight={700}>{t("team_details.members.title")}</Typography>
                        {canControl && (
                            <Button variant="outlined" color="secondary" startIcon={<PersonAddIcon />} onClick={() => setMemberModalOpen(true)}>
                                {t("team_details.admin.add_member")}
                            </Button>
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        {teamData.users.map((user) => (
                            <Grid size={{xs: 12, sm: 6, md: 4}} key={user.id}>
                                <Card sx={{
                                    borderRadius: "16px",
                                    position: "relative",
                                    border: user.isLeader ? "2px solid" : "1px solid #eee",
                                    borderColor: user.isLeader ? "secondary.main" : "#eee"
                                }} elevation={0}>
                                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar sx={{ bgcolor: user.isLeader ? "secondary.main" : "grey.200" }}>
                                            {user.fullName.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <Typography variant="body1" fontWeight={700}>{user.fullName}</Typography>
                                                {user.isLeader && <StarsIcon fontSize="small" color="secondary" />}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                        </Box>

                                        {/* Елементи керування для Адміна/Лідера */}
                                        {canControl && (
                                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                {!user.isLeader && (
                                                    <Tooltip title={t("team_details.admin.make_leader")}>
                                                        <IconButton size="small" onClick={() => handlePromoteToLeader(user.id)} color="secondary">
                                                            <VerifiedUserIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {/* Не дозволяємо видаляти самого себе, якщо ти не Адмін */}
                                                {(isAdmin || user.id !== currentUserId) && (
                                                    <Tooltip title={t("team_details.admin.remove_member")}>
                                                        <IconButton size="small" onClick={() => handleDeleteMember(user.id)} color="error">
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* --- TAB 3: TOURNAMENTS --- */}
            {tabValue === 2 && (
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>{t("team_details.tournaments.title")}</Typography>
                    <Grid container spacing={2}>
                        {MOCK_TEAM_TOURNAMENTS.length > 0 ? (
                            MOCK_TEAM_TOURNAMENTS.map((trn) => (
                                <Grid size={{xs: 12}} key={trn.id}>
                                    <Card
                                        onClick={() => navigate(`/tournaments/${trn.id}`)}
                                        sx={{ borderRadius: "12px", cursor: "pointer", border: "1px solid #e0e0e0", "&:hover": { borderColor: "secondary.main" } }}
                                        elevation={0}
                                    >
                                        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <Avatar sx={{ bgcolor: "secondary.light" }}><EmojiEventsIcon /></Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={600}>{trn.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{trn.startDate}</Typography>
                                                </Box>
                                            </Box>
                                            <Chip label={t(`tournaments.statuses.${trn.status}`)} color="secondary" variant="outlined" size="small" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Typography sx={{ ml: 2 }} color="text.secondary">{t("team_details.tournaments.empty")}</Typography>
                        )}
                    </Grid>
                </Box>
            )}

            {/* --- MODAL: ADD MEMBER --- */}
            <Dialog open={memberModalOpen} onClose={() => setMemberModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("team_details.admin.member_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField label={t("team_details.admin.member_modal.full_name")} fullWidth />
                    <TextField label={t("team_details.admin.member_modal.email")} fullWidth />
                    <FormControlLabel control={<Checkbox color="secondary" />} label={t("team_details.admin.member_modal.is_leader")} />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMemberModalOpen(false)} color="inherit">{t("team_details.admin.cancel")}</Button>
                    <Button variant="contained" color="secondary" onClick={() => setMemberModalOpen(false)} sx={{ fontWeight: 700 }}>
                        {t("team_details.admin.member_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};