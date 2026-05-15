import {Box, Button, Card, CardContent, Divider, Grid, Paper, Stack, TextField, Typography} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UndoIcon from "@mui/icons-material/Undo";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";
import {tournamentService} from "../../../../services/impl/TournamentService";
import {toLocalInput} from "../../../../utils/data.ts";

export const InfoTab = ({ state, t }: any) => {
    const { status } = state.tournamentData;

    const statusActions = [
        {
            show: status === "DRAFT",
            label: t("tournament_details.actions.openRegistration"),
            color: "success",
            icon: <PlayArrowIcon />,
            action: () => state.handleStatusAction(tournamentService.startRegistration.bind(tournamentService), {
                title: t("tournament_details.dialog.startRegTitle"),
                desc: t("tournament_details.dialog.startRegDesc")
            })
        },
        {
            show: status === "REGISTRATION",
            label: t("tournament_details.actions.startTournament"),
            color: "primary",
            icon: <PlayArrowIcon />,
            action: () => state.handleStatusAction(tournamentService.startTournament.bind(tournamentService), {
                title: t("tournament_details.dialog.startTourTitle"),
                desc: t("tournament_details.dialog.startTourDesc")
            })
        },
        {
            show: status === "REGISTRATION",
            label: t("tournament_details.actions.backToDraft"),
            color: "inherit",
            variant: "outlined",
            icon: <UndoIcon />,
            action: () => state.handleStatusAction(tournamentService.setTournamentToDraft.bind(tournamentService), {
                title: t("tournament_details.dialog.toDraftTitle"),
                desc: t("tournament_details.dialog.toDraftDesc")
            })
        },
        {
            show: status === "RUNNING",
            label: t("tournament_details.actions.completeTournament"),
            color: "success",
            icon: <CheckCircleIcon />,
            action: () => state.handleStatusAction(tournamentService.finishTournament.bind(tournamentService), {
                title: t("tournament_details.dialog.finishTitle"),
                desc: t("tournament_details.dialog.finishDesc")
            })
        },
        {
            show: status === "RUNNING",
            label: t("tournament_details.actions.cancelStart"),
            color: "inherit",
            variant: "outlined",
            icon: <UndoIcon />,
            action: () => state.handleStatusAction(tournamentService.rollbackStartTournament.bind(tournamentService), {
                title: t("tournament_details.dialog.rollbackStartTitle"),
                desc: t("tournament_details.dialog.rollbackStartDesc")
            })
        },
        {
            show: status === "FINISHED",
            label: t("tournament_details.actions.reopenTournament"),
            color: "warning",
            variant: "outlined",
            icon: <UndoIcon />,
            action: () => state.handleStatusAction(tournamentService.rollbackFinishTournament.bind(tournamentService), {
                title: t("tournament_details.dialog.rollbackFinishTitle"),
                desc: t("tournament_details.dialog.rollbackFinishDesc")
            })
        }
    ];

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                {state.isEditingInfo ? (
                    <Paper sx={{ p: 4, borderRadius: "24px", border: "1px solid #e0e0e0" }}>
                        <Stack spacing={3}>
                            <ErrorMessages errors={state.errors} />
                            <TextField fullWidth label={t("tournaments.admin.fields.name")} value={state.editFormData.name} onChange={(e) => state.setEditFormData({ ...state.editFormData, name: e.target.value })} />
                            <TextField fullWidth multiline rows={6} label={t("tournaments.admin.fields.description")} value={state.editFormData.description} onChange={(e) => state.setEditFormData({ ...state.editFormData, description: e.target.value })} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6 }}><TextField disabled={status === "RUNNING" || status=== "FINISHED"} fullWidth type="datetime-local" label={t("tournaments.admin.fields.startReg")} InputLabelProps={{ shrink: true }} value={state.editFormData.startRegistration} onChange={(e) => state.setEditFormData({ ...state.editFormData, startRegistration: e.target.value })} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField disabled={status === "RUNNING" || status=== "FINISHED"} fullWidth type="datetime-local" label={t("tournaments.admin.fields.endReg")} InputLabelProps={{ shrink: true }} value={state.editFormData.endRegistration} onChange={(e) => state.setEditFormData({ ...state.editFormData, endRegistration: e.target.value })} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth type="number" label={t("tournaments.admin.fields.maxTeams")} value={state.editFormData.maxCountOfTeam} onChange={(e) => state.setEditFormData({ ...state.editFormData, maxCountOfTeam: Number(e.target.value) })} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth type="number" label={t("tournaments.admin.fields.rounds")} value={state.editFormData.countOfRounds} onChange={(e) => state.setEditFormData({ ...state.editFormData, countOfRounds: Number(e.target.value) })} /></Grid>
                            </Grid>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={state.handleSaveUpdate} sx={{ borderRadius: "12px" }}>{t("common.save")}</Button>
                                <Button variant="outlined" onClick={() => state.setIsEditingInfo(false)} sx={{ borderRadius: "12px" }}>{t("common.cancel")}</Button>
                            </Box>
                        </Stack>
                    </Paper>
                ) : (
                    <Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom>{t("tournament_details.tabs.info")}</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>
                            {state.tournamentData.description || t("tournament_details.info.no_description")}
                        </Typography>
                    </Box>
                )}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                    <Card sx={{ borderRadius: "24px", p: 1, border: "1px solid #f0f0f0" }} elevation={0}>
                        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>{t("tournament_details.info.reg_period")}</Typography>
                                <Typography variant="body1" fontWeight={600}>{toLocalInput(state.tournamentData.startRegistration)} — {toLocalInput(state.tournamentData.endRegistration)}</Typography>
                            </Box>
                            <Divider />
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography color="text.secondary">{t("tournament_details.info.max_teams")}</Typography><Typography fontWeight={800}>{state.tournamentData.maxCountOfTeam}</Typography></Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography color="text.secondary">{t("tournament_details.info.rounds_count")}</Typography><Typography fontWeight={800}>{state.tournamentData.countOfRounds}</Typography></Box>
                        </CardContent>
                    </Card>

                    {state.isAdmin && (
                        <Card sx={{ borderRadius: "24px", p: 2, border: "2px solid #edf2f7", bgcolor: "#f8fafc" }} elevation={0}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: "primary.main", textTransform: "uppercase" }}>{t("tournament_details.control_panel")}</Typography>
                            <Stack spacing={1.5}>
                                {statusActions.filter(a => a.show).map((action, i) => (
                                    <Button key={i} fullWidth variant={(action.variant as any) || "contained"} color={action.color as any} startIcon={action.icon} onClick={action.action}>
                                        {action.label}
                                    </Button>
                                ))}
                                <Divider sx={{ my: 1 }} />
                                <Button fullWidth color="error" startIcon={<DeleteIcon />}
                                        onClick={() => state.handleStatusAction(tournamentService.deleteTournament.bind(tournamentService), {
                                            title: t("tournament_details.dialog.deleteTitle"),
                                            desc: t("tournament_details.dialog.deleteDesc"),
                                            color: "error",
                                            isDelete: true
                                        })}>
                                    {t("common.delete")}
                                </Button>
                            </Stack>
                        </Card>
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
};