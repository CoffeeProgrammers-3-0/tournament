import {useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import {useTranslation} from "react-i18next";
import SaveIcon from "@mui/icons-material/Save";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import {useTeamDetails} from "./useTeamDetails";
import {TeamHeader} from "./components/TeamHeader";
import {MemberCard} from "./components/MemberCard";

export const TeamDetailsPage = () => {
    const { t } = useTranslation();
    const {
        teamData, loading, canControl, isAdmin, currentUserId,
        isEditing, setIsEditing, tabValue, setTabValue,
        handleUpdate, handleAddMember, handleDeleteMember, handlePromote
    } = useTeamDetails();

    // Стейт для модалки
    const [memberModal, setMemberModal] = useState(false);
    const [newMember, setNewMember] = useState({ fullName: "", email: "", isLeader: false });

    // Стейт для форми редагування інфо
    const [editForm, setEditForm] = useState({ name: "", organization: "", contact: "" });

    // Відкриття редагування з заповненням даних
    const startEditing = () => {
        if (teamData) {
            setEditForm({ name: teamData.name, organization: teamData.organization, contact: teamData.contact });
            setIsEditing(true);
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (!teamData) return <Typography align="center" sx={{ mt: 5 }}>{t("team_details.not_found")}</Typography>;

    return (
        <Container maxWidth="lg" sx={{ pb: 8 }}>
            <TeamHeader team={teamData} canControl={canControl && !isEditing} onEdit={startEditing} />

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="secondary" indicatorColor="secondary" sx={{ mb: 4 }}>
                <Tab label={t("team_details.tabs.info")} />
                <Tab label={t("team_details.tabs.members")} />
                <Tab label={t("team_details.tabs.tournaments")} />
            </Tabs>

            {/* TAB: INFO */}
            {tabValue === 0 && (
                <Grid container spacing={4}>
                    <Grid size={{xs:12, md: 8}}>
                        {isEditing ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField fullWidth label={t("team_details.info.team_name")} value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                                <TextField fullWidth label={t("team_details.info.org_name")} value={editForm.organization} onChange={(e) => setEditForm({...editForm, organization: e.target.value})} />
                                <TextField fullWidth label={t("team_details.info.contact_person")} value={editForm.contact} onChange={(e) => setEditForm({...editForm, contact: e.target.value})} />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button variant="contained" color="secondary" startIcon={<SaveIcon />} onClick={() => handleUpdate(editForm)}>{t("common.save")}</Button>
                                    <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>{t("common.cancel")}</Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: "16px", border: "1px solid #eee" }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>{t("team_details.tabs.info")}</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Typography color="text.secondary" variant="caption">{t("team_details.info.org_name")}</Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>{teamData.organization || "—"}</Typography>
                                <Typography color="text.secondary" variant="caption">{t("team_details.info.contact_person")}</Typography>
                                <Typography variant="body1" fontWeight={600}>{teamData.contact || "—"}</Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* TAB: MEMBERS */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                        <Typography variant="h5" fontWeight={700}>{t("team_details.members.title")}</Typography>
                        {canControl && (
                            <Button variant="contained" color="secondary" startIcon={<PersonAddIcon />} onClick={() => setMemberModal(true)} sx={{ borderRadius: "12px", color: "black" }}>
                                {t("team_details.admin.add_member")}
                            </Button>
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        {teamData.users.map(user => (
                            <Grid size={{xs:12, sm: 6, md: 4}} key={user.id}>
                                <MemberCard
                                    user={user}
                                    canControl={canControl && (isAdmin || user.id !== currentUserId)}
                                    onDelete={() => handleDeleteMember(user.id)}
                                    onPromote={() => handlePromote(user.id)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* TAB: TOURNAMENTS */}
            {tabValue === 2 && (
                <Box sx={{ py: 6, textAlign: "center", bgcolor: "#f9f9f9", borderRadius: "24px" }}>
                    <Typography color="text.secondary">{t("team_details.tournaments.coming_soon")}</Typography>
                </Box>
            )}

            {/* MODAL: ADD MEMBER */}
            <Dialog open={memberModal} onClose={() => setMemberModal(false)} fullWidth maxWidth="xs">
                <DialogTitle fontWeight={700}>{t("team_details.admin.member_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField fullWidth label="Full Name" value={newMember.fullName} onChange={e => setNewMember({...newMember, fullName: e.target.value})} />
                    <TextField fullWidth label="Email" type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                    <FormControlLabel control={<Checkbox checked={newMember.isLeader} onChange={e => setNewMember({...newMember, isLeader: e.target.checked})} />} label="Set as Leader" />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMemberModal(false)}>{t("common.cancel")}</Button>
                    <Button variant="contained" color="secondary" onClick={() => { handleAddMember(newMember); setMemberModal(false); }}>{t("common.add")}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};