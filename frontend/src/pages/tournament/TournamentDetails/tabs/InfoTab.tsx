import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    MenuItem,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import {ErrorMessages} from "../../../../components/main/ErrorMessages.tsx";

export const InfoTab = ({ state, formatDate, t }: any) => {
    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                {state.isEditingInfo ? (
                    <Paper sx={{ p: 4, borderRadius: "24px", border: "1px solid #e0e0e0" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <ErrorMessages errors={state.errors} />
                            {state.tournamentData.status !== state.editFormData.status &&
                                <Alert severity="warning" sx={{mb: 3, borderRadius: "16px"}}>
                                    <AlertTitle sx={{fontWeight: 700}}>{t("common.warning")}</AlertTitle>
                                </Alert>
                            }
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 8 }}>
                                    <TextField fullWidth label={t("tournaments.admin.fields.name")} value={state.editFormData.name} onChange={(e) => state.setEditFormData({ ...state.editFormData, name: e.target.value })} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField select fullWidth label={t("tournaments.admin.fields.status", "Статус")} value={state.editFormData.status} onChange={(e) => state.handleStatusChange(e.target.value)}>
                                        <MenuItem value="DRAFT">{t("tournaments.statuses.DRAFT")}</MenuItem>
                                        <MenuItem value="REGISTRATION">{t("tournaments.statuses.REGISTRATION")}</MenuItem>
                                        <MenuItem value="RUNNING">{t("tournaments.statuses.RUNNING")}</MenuItem>
                                        <MenuItem value="FINISHED">{t("tournaments.statuses.FINISHED")}</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            <TextField fullWidth multiline rows={6} label={t("tournaments.admin.fields.description")} value={state.editFormData.description} onChange={(e) => state.setEditFormData({ ...state.editFormData, description: e.target.value })} />

                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <TextField fullWidth type="datetime-local" label={t("tournaments.admin.fields.startReg")} InputLabelProps={{ shrink: true }} value={state.editFormData.startRegistration} onChange={(e) => state.setEditFormData({ ...state.editFormData, startRegistration: e.target.value })} />
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <TextField fullWidth type="datetime-local" label={t("tournaments.admin.fields.endReg")} InputLabelProps={{ shrink: true }} value={state.editFormData.endRegistration} onChange={(e) => state.setEditFormData({ ...state.editFormData, endRegistration: e.target.value })} inputProps={{ min: state.editFormData.startRegistration || undefined }} />
                                </Grid>
                                <Grid size={{xs: 6, sm: 6}}>
                                    <TextField fullWidth type="number" label={t("tournaments.admin.fields.maxTeams")} value={state.editFormData.maxCountOfTeam} onChange={(e) => state.setEditFormData({ ...state.editFormData, maxCountOfTeam: Number(e.target.value) })} inputProps={{ min: 3 }} />
                                </Grid>
                                <Grid size={{xs: 6, sm: 6}}>
                                    <TextField fullWidth type="number" label={t("tournaments.admin.fields.rounds")} value={state.editFormData.countOfRounds} onChange={(e) => state.setEditFormData({ ...state.editFormData, countOfRounds: Number(e.target.value) })} inputProps={{ min: 1 }} />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                                <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={state.handleSaveUpdate} sx={{ borderRadius: "12px", px: 4 }}>{t("common.save")}</Button>
                                <Button variant="outlined" size="large" onClick={() => state.setIsEditingInfo(false)} sx={{ borderRadius: "12px" }}>{t("common.cancel")}</Button>
                            </Box>
                        </Box>
                    </Paper>
                ) : (
                    <Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom>{t("tournament_details.tabs.info")}</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8, color: "text.primary" }}>
                            {state.tournamentData.description || t("tournament_details.info.no_description")}
                        </Typography>
                    </Box>
                )}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: "24px", p: 1, border: "1px solid #f0f0f0" }} elevation={0}>
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase" }}>{t("tournament_details.info.reg_period")}</Typography>
                            <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>{formatDate(state.tournamentData.startRegistration)} — {formatDate(state.tournamentData.endRegistration)}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography color="text.secondary" fontWeight={500}>{t("tournament_details.info.max_teams")}</Typography>
                            <Typography fontWeight={800}>{state.tournamentData.maxCountOfTeam}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography color="text.secondary" fontWeight={500}>{t("tournament_details.info.rounds_count")}</Typography>
                            <Typography fontWeight={800}>{state.tournamentData.countOfRounds}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};