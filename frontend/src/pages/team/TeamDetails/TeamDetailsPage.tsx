import {useCallback, useEffect, useState} from "react"; // Added useEffect
import {
    Autocomplete,
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
    Typography
} from "@mui/material";
import {useTranslation} from "react-i18next";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockIcon from "@mui/icons-material/Lock";

import {useTeamDetails} from "./useTeamDetails";
import {TeamHeader} from "./components/TeamHeader.tsx";
import {MemberCard} from "./components/MemberCard.tsx";
import {userService} from "../../../services/impl/UserService.ts";

export const TeamDetailsPage = () => {
    const { t } = useTranslation();
    const {
        teamData, loading, isAdmin, currentUserId,
        tabValue, setTabValue, membersByTournament,
        canManageTournament, handleAddMember, handleDeleteMember, handlePromote,
        errors, clearErrors, isActionLoading,
        isEditingHeader, setIsEditingHeader, headerForm, setHeaderForm, handleUpdateTeam
    } = useTeamDetails();

    // 1. States for New Member & Search
    const [memberModal, setMemberModal] = useState<{ open: boolean, tournamentId: number | null }>({ open: false, tournamentId: null });
    const [newMember, setNewMember] = useState({ fullName: "", email: "", isLeader: false });
    const [emailSearchLoading, setEmailSearchLoading] = useState(false);
    const [emailOptions, setEmailOptions] = useState<any[]>([]);
    const [confirm, setConfirm] = useState<{ open: boolean, title: string, text: string, onConfirm: () => void } | null>(null);

    // 2. Search Logic
    const handleEmailSearch = useCallback(async (email: string) => {
        if (!email || email.length < 3) {
            setEmailOptions([]);
            return;
        }

        setEmailSearchLoading(true);
        try {
            const results = await userService.getUserByEmail(email);
            setEmailOptions(results || []);
        } catch (err) {
            console.error("Search failed", err);
            setEmailOptions([]);
        } finally {
            setEmailSearchLoading(false);
        }
    }, []);

    // 3. Debounce Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (newMember.email && newMember.email.length >= 3) {
                handleEmailSearch(newMember.email);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [newMember.email, handleEmailSearch]);

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;
    if (!teamData) return <Typography align="center" sx={{ mt: 5 }}>{t("common.not_found")}</Typography>;

    const closeMemberModal = () => {
        setMemberModal({ open: false, tournamentId: null });
        setNewMember({ fullName: "", email: "", isLeader: false });
        setEmailOptions([]);
        clearErrors();
    };

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: { xs: 2, md: 4 } }}>
            {/* Error handling for general actions */}
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
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="secondary" indicatorColor="secondary">
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
                        const isMaxReached = currentCount >= data.maxMembers;

                        return (
                            <Box key={tId} sx={{ mb: 6 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight={800} color="primary">{data.name}</Typography>
                                        {isLocked && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "warning.main", mt: 1 }}>
                                                <LockIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={700}>{t("team_details.status.locked_started")}</Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {manageStatus.can && (
                                        <Button
                                            variant="contained"
                                            disabled={isMaxReached}
                                            color="secondary"
                                            startIcon={<PersonAddIcon />}
                                            onClick={() => setMemberModal({ open: true, tournamentId: tournamentIdNum })}
                                            sx={{ borderRadius: "12px", color: "black" }}
                                        >
                                            {t("team_details.admin.add_member")}
                                        </Button>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    {data.members.map((user: any) => (
                                        <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={user.id}>
                                            <MemberCard
                                                user={user}
                                                canControl={manageStatus.can && (isAdmin || user.id !== currentUserId)}
                                                onDelete={() => setConfirm({
                                                    open: true,
                                                    title: t("team_details.confirm.remove_title"),
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

            {/* Member Add Dialog */}
            <Dialog open={memberModal.open} onClose={closeMemberModal} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: "24px" } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>{t("team_details.admin.member_modal.title")}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {errors.length > 0 && (
                        <Box sx={{ bgcolor: "error.light", color: "error.contrastText", p: 2, borderRadius: "12px" }}>
                            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                                {errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </Box>
                    )}

                    <Autocomplete
                        freeSolo
                        options={emailOptions}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.email)}
                        loading={emailSearchLoading}
                        onInputChange={(_, value) => setNewMember({ ...newMember, email: value })}
                        onChange={(_, newValue) => {
                            if (newValue && typeof newValue !== 'string') {
                                setNewMember({
                                    ...newMember,
                                    email: newValue.email,
                                    fullName: newValue.fullName || ""
                                });
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label={t("team_details.admin.member_modal.email")}
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {emailSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} key={option.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" fontWeight={700}>{option.email}</Typography>
                                <Typography variant="caption" color="text.secondary">{option.fullName}</Typography>
                            </Box>
                        )}
                    />

                    <TextField
                        fullWidth
                        label={t("team_details.admin.member_modal.full_name")}
                        value={newMember.fullName}
                        onChange={e => setNewMember({...newMember, fullName: e.target.value})}
                        variant="outlined"
                    />

                    <FormControlLabel
                        control={<Checkbox checked={newMember.isLeader} onChange={e => setNewMember({...newMember, isLeader: e.target.checked})} color="secondary" />}
                        label={t("team_details.admin.member_modal.is_leader")}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={closeMemberModal} sx={{ fontWeight: 600 }}>{t("common.cancel")}</Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        disabled={isActionLoading}
                        sx={{ borderRadius: "10px", px: 3, fontWeight: 700, color: "black" }}
                        onClick={async () => {
                            if (memberModal.tournamentId) {
                                const success = await handleAddMember(newMember as any, memberModal.tournamentId);
                                if (success) closeMemberModal();
                            }
                        }}
                    >
                        {isActionLoading ? <CircularProgress size={24} /> : t("team_details.admin.member_modal.submit")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog open={!!confirm?.open} onClose={() => setConfirm(null)} PaperProps={{ sx: { borderRadius: "20px" } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>{confirm?.title}</DialogTitle>
                <DialogContent><DialogContentText>{confirm?.text}</DialogContentText></DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirm(null)}>{t("common.no")}</Button>
                    <Button
                        onClick={() => { confirm?.onConfirm(); setConfirm(null); }}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: "10px", fontWeight: 700 }}
                    >
                        {t("common.yes_confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};