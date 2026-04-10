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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import {useTeamDetails} from "./useTeamDetails";
import {TeamHeader} from "./components/TeamHeader.tsx";
import {MemberCard} from "./components/MemberCard.tsx";
// import { TeamHeader } from "./components/TeamHeader"; // Переконайтеся, що імпорти вірні
// import { MemberCard } from "./components/MemberCard";

export const TeamDetailsPage = () => {
    const { t } = useTranslation();
    const {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember, handleDeleteMember, handlePromote,
        errors, clearErrors, isActionLoading,
        isEditingHeader, setIsEditingHeader, headerForm, setHeaderForm, handleUpdateTeam
    } = useTeamDetails();

    const [memberModal, setMemberModal] = useState<{ open: boolean, tournamentId: number | null }>({ open: false, tournamentId: null });
    const [confirm, setConfirm] = useState<{ open: boolean, title: string, text: string, onConfirm: () => void } | null>(null);
    const [newMember, setNewMember] = useState({ fullName: "", email: "", isLeader: false });

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (!teamData) return <Typography align="center" sx={{ mt: 5 }}>{t("common.not_found")}</Typography>;

    const closeMemberModal = () => {
        setMemberModal({ open: false, tournamentId: null });
        setNewMember({ fullName: "", email: "", isLeader: false });
        clearErrors();
    };

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: { xs: 2, md: 4 } }}>
            {errors.length > 0 && !memberModal.open && (
                <Box sx={{ mb: 3, p: 2, bgcolor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "12px" }}>
                    {errors.map((err, i) => <Typography key={i} color="error" variant="body2" fontWeight={600}>{err}</Typography>)}
                </Box>
            )}

            <TeamHeader
                team={teamData}
                isAdmin={isAdmin}
                isEditing={isEditingHeader}
                formData={headerForm}
                setFormData={setHeaderForm}
                onEdit={() => setIsEditingHeader(true)}
                onCancel={() => { setIsEditingHeader(false); clearErrors(); }}
                onSave={handleUpdateTeam}
                loading={isActionLoading}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    variant="scrollable" // Дозволяє скролити таби на вузьких екранах
                    scrollButtons="auto"
                >
                    <Tab label={t("team_details.tabs.members")} />
                    <Tab label={t("team_details.tabs.info")} />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <Box>
                    {Object.entries(membersByTournament).map(([tId, data]: any) => {
                        const tournamentIdNum = Number(tId);
                        const manageStatus = canManageTournament(tournamentIdNum);
                        const isLocked = !manageStatus.can && manageStatus.reason === "TOURNAMENT_STARTED";

                        const currentCount = data.members.length;
                        const maxMembers = data.maxMembers;
                        const isMaxReached = currentCount >= maxMembers;
                        const isMinMet = currentCount >= 3;

                        return (
                            <Box key={tId} sx={{ mb: 6 }}>
                                {/* Оптимізований заголовок турніру для мобільних */}
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                    alignItems: { xs: "flex-start", sm: "flex-end" },
                                    gap: 2,
                                    mb: 3
                                }}>
                                    <Box sx={{ width: "100%" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                            <Typography variant="h5" fontWeight={800} color="primary" sx={{ wordBreak: "break-word" }}>
                                                {data.name}
                                            </Typography>
                                            <Box sx={{
                                                px: 1.5, py: 0.5, borderRadius: "8px",
                                                bgcolor: isMaxReached ? "success.light" : (!isMinMet ? "error.light" : "grey.200"),
                                                color: isMaxReached ? "success.dark" : (!isMinMet ? "error.dark" : "text.secondary"),
                                                fontWeight: 800, fontSize: "0.85rem", whiteSpace: "nowrap"
                                            }}>
                                                {currentCount} / {maxMembers}
                                            </Box>
                                        </Box>

                                        {!isMinMet && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "error.main", mt: 1 }}>
                                                <WarningAmberIcon sx={{ fontSize: 18 }} />
                                                <Typography variant="caption" fontWeight={700}>
                                                    {t("team_details.warnings.min_members", { defaultValue: "Minimum 3 members required!" })}
                                                </Typography>
                                            </Box>
                                        )}

                                        {isLocked && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "warning.main", mt: 1 }}>
                                                <LockIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={700}>{t("team_details.status.locked_started")}</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Кнопка розтягується на всю ширину на телефонах */}
                                    <Box sx={{ width: { xs: "100%", sm: "auto" }, flexShrink: 0 }}>
                                        {manageStatus.can ? (
                                            isMaxReached ? (
                                                <Tooltip title={t("team_details.warnings.max_reached", { defaultValue: "Maximum members limit reached" })}>
                                                    <span>
                                                        <Button fullWidth variant="contained" disabled startIcon={<PersonAddIcon />} sx={{ borderRadius: "12px" }}>
                                                            {t("team_details.admin.add_member")}
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained" color="secondary" startIcon={<PersonAddIcon />}
                                                    onClick={() => setMemberModal({ open: true, tournamentId: tournamentIdNum })}
                                                    sx={{ borderRadius: "12px", color: "black", py: { xs: 1.2, sm: 1 } }}
                                                >
                                                    {t("team_details.admin.add_member")}
                                                </Button>
                                            )
                                        ) : !isAdmin && (
                                            <Tooltip title={t(`team_details.reasons.${manageStatus.reason}`)}>
                                                <Box sx={{ opacity: 0.5 }}>
                                                    <Button fullWidth variant="outlined" disabled startIcon={<PersonAddIcon />}>
                                                        {t("team_details.admin.add_member")}
                                                    </Button>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    {data.members.map((user: any) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user.id}>
                                            <MemberCard
                                                user={user}
                                                canControl={manageStatus.can && (isAdmin || user.id !== currentUserId)}
                                                onDelete={() => setConfirm({
                                                    open: true,
                                                    title: t("common.confirm_delete"),
                                                    text: `${t("team_details.confirm.remove_text")} ${user.fullName}?`,
                                                    onConfirm: () => handleDeleteMember(user.id, tournamentIdNum)
                                                })}
                                                onPromote={() => setConfirm({
                                                    open: true,
                                                    title: t("common.confirm_promote"),
                                                    text: `${t("team_details.confirm.promote_text")} ${user.fullName}?`,
                                                    onConfirm: () => handlePromote(user.id, tournamentIdNum)
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

            {/* Модалки з адаптивними відступами */}
            <Dialog open={memberModal.open} onClose={closeMemberModal} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "24px", m: { xs: 2, sm: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>{t("team_details.admin.member_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {errors.length > 0 && (
                        <Box sx={{ bgcolor: "error.light", color: "error.contrastText", p: 2, borderRadius: "12px", mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                                {t("common.errors.check_fields")}
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.875rem" }}>
                                {errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </Box>
                    )}

                    <TextField fullWidth label="Full Name" value={newMember.fullName} onChange={e => setNewMember({...newMember, fullName: e.target.value})} variant="outlined" />
                    <TextField fullWidth label="Email" type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} variant="outlined" />
                    <FormControlLabel control={<Checkbox checked={newMember.isLeader} onChange={e => setNewMember({...newMember, isLeader: e.target.checked})} color="secondary" />} label="Set as Leader" />
                </DialogContent>

                <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button fullWidth onClick={closeMemberModal} sx={{ fontWeight: 600, mb: { xs: 1, sm: 0 } }}>{t("common.cancel")}</Button>
                    <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        disabled={isActionLoading}
                        sx={{ borderRadius: "10px", px: 3, fontWeight: 700, color: "black", m: "0 !important" }}
                        onClick={async () => {
                            if (memberModal.tournamentId) {
                                const success = await handleAddMember(newMember as any, memberModal.tournamentId);
                                if (success) closeMemberModal();
                            }
                        }}
                    >
                        {isActionLoading ? <CircularProgress size={24} /> : t("common.add")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={!!confirm?.open}
                onClose={() => setConfirm(null)}
                PaperProps={{ sx: { borderRadius: "20px", m: { xs: 2, sm: 3 } } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>{confirm?.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "text.primary" }}>{confirm?.text}</DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button fullWidth onClick={() => setConfirm(null)} variant="outlined" sx={{ borderRadius: "10px", mb: { xs: 1, sm: 0 } }}>
                        {t("common.no")}
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => { confirm?.onConfirm(); setConfirm(null); }}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: "10px", px: 3, fontWeight: 700, m: "0 !important" }}
                    >
                        {t("common.yes_confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};