import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Cookies from "js-cookie";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import {teamService} from "../../services/impl/TeamService";
import type {TeamFullResponseDto, TeamUpdateRequestDto} from "../../entities/team/team.dto.ts";
import type {UserCreateRequestForTeamDto} from "../../entities/user/user.dto.ts";

export const TeamDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const currentUserId = Number(Cookies.get("userId"));
    const isAdmin = Cookies.get("role") === "ADMIN";

    const [teamData, setTeamData] = useState<TeamFullResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<TeamUpdateRequestDto>({ name: "", organization: "", contact: "" });

    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [newMember, setNewMember] = useState<UserCreateRequestForTeamDto>({ fullName: "", email: "", isLeader: false });

    // --- DATA FETCHING ---
    const fetchTeamDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await teamService.getTeamById(Number(id));
            setTeamData(data);
            setEditForm({
                name: data.name,
                organization: data.organization,
                contact: data.contact
            });
        } catch (err) {
            setError(t("team_details.errors.fetch_failed"));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchTeamDetails();
    }, [fetchTeamDetails]);

    // --- PERMISSIONS ---
    const isTeamLeader = teamData?.users.find(u => u.id === currentUserId)?.isLeader;
    const canControl = isAdmin || isTeamLeader;

    // --- ACTIONS ---
    const handleUpdateTeam = async () => {
        if (!teamData) return;
        try {
            const updated = await teamService.updateTeam(teamData.id, editForm);
            setTeamData(updated);
            setIsEditing(false);
        } catch (err) {
            setError(t("team_details.errors.update_failed"));
        }
    };

    const handleAddMember = async () => {
        if (!teamData) return;
        try {
            const updated = await teamService.addMember(teamData.id, newMember);
            setTeamData(updated);
            setMemberModalOpen(false);
            setNewMember({ fullName: "", email: "", isLeader: false });
        } catch (err) {
            setError(t("team_details.errors.add_member_failed"));
        }
    };

    const handleDeleteMember = async (userId: number) => {
        if (!teamData || !window.confirm(t("team_details.admin.delete_member_confirm"))) return;
        try {
            const updated = await teamService.removeMember(teamData.id, userId);
            setTeamData(updated);
        } catch (err) {
            setError(t("team_details.errors.remove_member_failed"));
        }
    };

    const handlePromoteToLeader = async (userId: number) => {
        if (!teamData) return;
        try {
            const updated = await teamService.setTeamLeader(teamData.id, userId);
            setTeamData(updated);
        } catch (err) {
            setError(t("team_details.errors.promote_failed"));
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    if (!teamData) return <Typography>{t("team_details.not_found")}</Typography>;

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

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }} textColor="secondary" indicatorColor="secondary">
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
                                <TextField fullWidth label={t("team_details.info.team_name")} value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                                <TextField fullWidth label={t("team_details.info.org_name")} value={editForm.organization} onChange={(e) => setEditForm({...editForm, organization: e.target.value})} />
                                <TextField fullWidth label={t("team_details.info.contact_person")} value={editForm.contact} onChange={(e) => setEditForm({...editForm, contact: e.target.value})} />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={handleUpdateTeam}>
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

            {/* --- TAB 2: MEMBERS --- */}
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
                                        {canControl && (
                                            <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                {!user.isLeader && (
                                                    <Tooltip title={t("team_details.admin.make_leader")}>
                                                        <IconButton size="small" onClick={() => handlePromoteToLeader(user.id)} color="secondary">
                                                            <VerifiedUserIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
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
            {/* Тут потрібно буде додати реальний виклик, наприклад trnService.getTournamentsByTeam(teamId) */}
            {tabValue === 2 && (
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>{t("team_details.tournaments.title")}</Typography>
                    <Typography color="text.secondary">{t("team_details.tournaments.coming_soon")}</Typography>
                </Box>
            )}

            {/* --- MODAL: ADD MEMBER --- */}
            <Dialog open={memberModalOpen} onClose={() => setMemberModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{t("team_details.admin.member_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <TextField
                        label={t("team_details.admin.member_modal.full_name")}
                        fullWidth
                        value={newMember.fullName}
                        onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                    />
                    <TextField
                        label={t("team_details.admin.member_modal.email")}
                        fullWidth
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                color="secondary"
                                checked={newMember.isLeader === true}
                                onChange={(e) => setNewMember({...newMember, isLeader: e.target.checked ? true : false})}
                            />
                        }
                        label={t("team_details.admin.member_modal.is_leader")}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMemberModalOpen(false)} color="inherit">{t("team_details.admin.cancel")}</Button>
                    <Button variant="contained" color="secondary" onClick={handleAddMember} sx={{ fontWeight: 700 }}>
                        {t("team_details.admin.member_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};