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
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Grid,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {useTranslation} from "react-i18next";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import LockIcon from "@mui/icons-material/Lock";

import {useTeamDetails} from "./useTeamDetails";
import {TeamHeader} from "./components/TeamHeader";
import {MemberCard} from "./components/MemberCard";

export const TeamDetailsPage = () => {
    const { t } = useTranslation();
    const {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember, handleDeleteMember, handlePromote
    } = useTeamDetails();

    const [memberModal, setMemberModal] = useState<{open: boolean, tournamentId: number | null}>({ open: false, tournamentId: null });
    const [newMember, setNewMember] = useState({ fullName: "", email: "", isLeader: false });
    const [confirm, setConfirm] = useState<{open: boolean, title: string, text: string, onConfirm: () => void} | null>(null);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (!teamData) return <Typography align="center" sx={{ mt: 5 }}>{t("common.not_found")}</Typography>;

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            <TeamHeader team={teamData} canControl={false} onEdit={() => {}} />

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="secondary" indicatorColor="secondary" sx={{ mb: 4 }}>
                <Tab label={t("team_details.tabs.members")} />
                <Tab label={t("team_details.tabs.info")} />
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    {Object.entries(membersByTournament).map(([tId, data]: any) => {
                        const manageStatus = canManageTournament(Number(tId));
                        const isLocked = !manageStatus.can && manageStatus.reason === "TOURNAMENT_STARTED";

                        return (
                            <Box key={tId} sx={{ mb: 6 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 2 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight={800} color="primary">{data.name}</Typography>
                                        {isLocked && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "warning.main", mt: 0.5 }}>
                                                <LockIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={700}>{t("team_details.status.locked_started")}</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {manageStatus.can ? (
                                        <Button
                                            variant="contained" color="secondary" startIcon={<PersonAddIcon />}
                                            onClick={() => setMemberModal({ open: true, tournamentId: Number(tId) })}
                                            sx={{ borderRadius: "12px", color: "black" }}
                                        >
                                            {t("team_details.admin.add_member")}
                                        </Button>
                                    ) : !isAdmin && (
                                        <Tooltip title={t(`team_details.reasons.${manageStatus.reason}`)}>
                                            <Box sx={{ opacity: 0.5 }}><Button variant="outlined" disabled startIcon={<PersonAddIcon />}>{t("team_details.admin.add_member")}</Button></Box>
                                        </Tooltip>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    {data.members.map((user: any) => (
                                        <Grid size={{xs:12, sm:4, md:3}} key={user.id}>
                                            <MemberCard
                                                user={user}
                                                canControl={manageStatus.can && (isAdmin || user.id !== currentUserId)}
                                                onDelete={() => setConfirm({
                                                    open: true,
                                                    title: t("common.confirm_delete"),
                                                    text: `${t("team_details.confirm.remove_text")} ${user.fullName}?`,
                                                    onConfirm: () => handleDeleteMember(user.id)
                                                })}
                                                onPromote={() => setConfirm({
                                                    open: true,
                                                    title: t("common.confirm_promote"),
                                                    text: `${t("team_details.confirm.promote_text")} ${user.fullName}?`,
                                                    onConfirm: () => handlePromote(user.id)
                                                })}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* MODAL: ADD MEMBER */}
            <Dialog open={memberModal.open} onClose={() => setMemberModal({ open: false, tournamentId: null })} fullWidth maxWidth="xs">
                <DialogTitle fontWeight={700}>{t("team_details.admin.member_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField fullWidth label="Full Name" value={newMember.fullName} onChange={e => setNewMember({...newMember, fullName: e.target.value})} />
                    <TextField fullWidth label="Email" type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                    <FormControlLabel control={<Checkbox checked={newMember.isLeader} onChange={e => setNewMember({...newMember, isLeader: e.target.checked})} />} label="Set as Leader" />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setMemberModal({ open: false, tournamentId: null })}>{t("common.cancel")}</Button>
                    <Button variant="contained" color="secondary" onClick={() => {
                        handleAddMember({...newMember, tournamentId: memberModal.tournamentId} as any);
                        setMemberModal({ open: false, tournamentId: null });
                    }}>{t("common.add")}</Button>
                </DialogActions>
            </Dialog>

            {/* UNIVERSAL CONFIRM DIALOG */}
            <Dialog open={!!confirm?.open} onClose={() => setConfirm(null)}>
                <DialogTitle>{confirm?.title}</DialogTitle>
                <DialogContent><DialogContentText>{confirm?.text}</DialogContentText></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirm(null)} color="inherit">{t("common.no")}</Button>
                    <Button onClick={() => { confirm?.onConfirm(); setConfirm(null); }} variant="contained" color="error" autoFocus>
                        {t("common.yes_confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};