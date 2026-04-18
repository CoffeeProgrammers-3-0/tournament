import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import type {RoundStatus} from "../../../../entities/round/round.dto.ts";
import {toLocalInput} from "../../../../utils/data.ts"; // Перевір правильність шляху імпорту

const ROUND_STATUSES: RoundStatus[] = ['DRAFT', 'ACTIVE', 'SUBMISSION_CLOSED', 'EVALUATED'];

export const RoundsTab = ({ state, t, navigate }: any) => {
    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center", flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight={800}>{t("tournament_details.rounds.title")}</Typography>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select value={state.selectedRoundStatus} onChange={(e) => state.setSelectedRoundStatus(e.target.value as RoundStatus)} sx={{ borderRadius: "12px", fontWeight: 600 }}>
                            {ROUND_STATUSES.filter(s => state.isAdmin || s !== 'DRAFT').map(s => (
                                <MenuItem key={s} value={s}>{t(`rounds.statuses.${s}`)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {state.isAdmin && (
                    state.tournamentData.countOfRounds > state.rounds.length  || state.selectedRoundStatus === 'DRAFT' ? (
                        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => state.setRoundModalOpen(true)} sx={{ borderRadius: "12px", fontWeight: 700, color: "black" }}>
                            {t("tournament_details.admin.add_round")}
                        </Button>
                    ) : (
                        <Button disabled variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => state.setRoundModalOpen(true)} sx={{ borderRadius: "12px", fontWeight: 700, color: "black" }}>
                            {t("tournament_details.admin.add_round")}
                        </Button>
                    )
                )}
            </Box>

            {state.loadingTab ? (
                <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={2}>
                    {state.rounds.length > 0 ? state.rounds.map((round: any) => (
                        <Grid size={{ xs: 12 }} key={round.id}>
                            <Card onClick={() => navigate(`/rounds/${round.id}`)} sx={{ borderRadius: "20px", cursor: "pointer", border: "1px solid #eee", transition: "0.3s", "&:hover": { borderColor: "primary.main", transform: "translateX(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" } }} elevation={0}>
                                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                        <Avatar sx={{ bgcolor: round.status === "ACTIVE" ? "primary.main" : "grey.100", color: round.status === "ACTIVE" ? "white" : "grey.400", width: 56, height: 56 }}><AssignmentIcon /></Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800}>{round.name}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>{toLocalInput(round.startDate)} — {toLocalInput(round.endDate)}</Typography>
                                        </Box>
                                    </Box>
                                    <Chip label={t(`rounds.statuses.${round.status}`)} color={round.status === "ACTIVE" ? "success" : "default"} sx={{ fontWeight: 700, borderRadius: "8px" }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    )) : (
                        <Box sx={{ textAlign: 'center', width: '100%', py: 8, bgcolor: "#fafafa", borderRadius: "24px" }}>
                            <Typography color="text.secondary" fontWeight={600}>{t("tournament_details.rounds.empty")}</Typography>
                        </Box>
                    )}
                </Grid>
            )}
        </Box>
    );
};