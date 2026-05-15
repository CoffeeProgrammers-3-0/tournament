import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    InputAdornment,
    Pagination,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {useTeams} from "./useTeams";
import {TeamCard} from "./components/TeamCard";

export const TeamsPage = () => {
    const { t } = useTranslation();
    const {
        teams, loading, searchQuery, setSearchQuery,
        page, setPage, totalPages, isAdmin, deleteTeam, errors, setErrors
    } = useTeams();

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teamId: number | null }>({
        open: false,
        teamId: null
    });

    const handleDeleteConfirm = async () => {
        if (deleteDialog.teamId) {
            const success = await deleteTeam(deleteDialog.teamId);
            if (success) setDeleteDialog({ open: false, teamId: null });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: "-0.02em", mb: 1 }}>
                    {isAdmin ? t("teams.admin_title") : t("teams.title")}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.8 }}>
                    {t("teams.subtitle")}
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 2, mb: 5, borderRadius: "20px", border: "1px solid", borderColor: "divider" }}>
                <TextField
                    fullWidth variant="standard"
                    placeholder={t("teams.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: <InputAdornment position="start" sx={{ ml: 1 }}><SearchIcon color="primary" /></InputAdornment>,
                        sx: { fontSize: "1.1rem" }
                    }}
                />
            </Paper>

            {errors.length > 0 && (
                <Alert severity="error" onClose={() => setErrors([])} sx={{ mb: 4, borderRadius: "16px" }}>
                    {errors.map((err, i) => <div key={i}>{err}</div>)}
                </Alert>
            )}

            {loading && teams.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 15 }}>
                    <CircularProgress thickness={5} size={60} />
                </Box>
            ) : (
                <>
                    <Grid container spacing={4}>
                        {teams.length > 0 ? (
                            teams.map((team) => (
                                <Grid size={{xs:12, sm: 6, md: 4}} key={team.id}>
                                    <TeamCard
                                        team={team}
                                        isAdmin={isAdmin}
                                        onDeleteClick={(id) => setDeleteDialog({ open: true, teamId: id })}
                                    />
                                </Grid>
                            ))
                        ) : (
                            <Grid size={{xs:12}}>
                                <Box sx={{ textAlign: "center", py: 12, bgcolor: "action.hover", borderRadius: "40px", border: "2px dashed", borderColor: "divider" }}>
                                    <GroupsIcon sx={{ fontSize: 100, color: "text.disabled", mb: 2, opacity: 0.3 }} />
                                    <Typography variant="h5" color="text.secondary">{t("teams.no_data")}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="large" />
                        </Box>
                    )}
                </>
            )}

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, teamId: null })} PaperProps={{ sx: { borderRadius: "24px", p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>{t("teams.confirm_delete_title")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t("teams.confirm_delete_text")}</DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, teamId: null })} variant="outlined" sx={{ borderRadius: "12px" }}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ borderRadius: "12px", fontWeight: 700 }}>
                        {t("common.yes_confirm")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};