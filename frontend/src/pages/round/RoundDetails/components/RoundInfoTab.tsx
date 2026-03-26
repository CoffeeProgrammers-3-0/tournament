import {Box, Button, Divider, Grid, MenuItem, TextField, Typography} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import type {RoundFullResponseDto, RoundStatus, RoundUpdateRequestDto} from "../../../../entities/round/round.dto";

type Props = {
    tabValue: number;
    roundData: RoundFullResponseDto;
    isAdmin: boolean;
    isEditingInfo: boolean;
    editFormData: RoundUpdateRequestDto;
    setEditFormData: React.Dispatch<React.SetStateAction<RoundUpdateRequestDto>>;
    handleStatusChange: (newStatus: RoundStatus) => void;
    handleSaveUpdate: () => Promise<void>;
    cancelEditing: () => void;
    t: (key: string, options?: any) => string;
};

export const RoundInfoTab = ({
                                 tabValue,
                                 roundData,
                                 isEditingInfo,
                                 editFormData,
                                 setEditFormData,
                                 handleStatusChange,
                                 handleSaveUpdate,
                                 cancelEditing,
                                 t,
                             }: Props) => {
    if (tabValue !== 0) return null;

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                {isEditingInfo ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <TextField
                                fullWidth
                                label={t("round_details.info.name")}
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                            <TextField
                                select
                                fullWidth
                                label={t("round_details.info.status")}
                                value={editFormData.status}
                                onChange={(e) => handleStatusChange(e.target.value as RoundStatus)}
                            >
                                <MenuItem value="DRAFT">{t("rounds.statuses.DRAFT")}</MenuItem>
                                <MenuItem value="ACTIVE">{t("rounds.statuses.ACTIVE")}</MenuItem>
                                <MenuItem value="SUBMISSION_CLOSED">{t("rounds.statuses.SUBMISSION_CLOSED")}</MenuItem>
                                <MenuItem value="EVALUATED">{t("rounds.statuses.EVALUATED")}</MenuItem>
                            </TextField>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label={t("round_details.info.start_date")}
                                InputLabelProps={{ shrink: true }}
                                value={editFormData.startDate}
                                onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label={t("round_details.info.end_date")}
                                InputLabelProps={{ shrink: true }}
                                value={editFormData.endDate}
                                onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            type="number"
                            label={t("round_details.info.winners_count")}
                            value={editFormData.countOfWinners}
                            onChange={(e) => setEditFormData({ ...editFormData, countOfWinners: Number(e.target.value) })}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t("round_details.info.task")}
                            value={editFormData.task}
                            onChange={(e) => setEditFormData({ ...editFormData, task: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t("round_details.info.requirements")}
                            value={editFormData.requirements}
                            onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveUpdate}>
                                {t("round_details.admin.save")}
                            </Button>
                            <Button variant="outlined" onClick={cancelEditing}>
                                {t("round_details.admin.cancel")}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="primary.main">
                                {t("round_details.info.task")}
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>
                                {roundData.task || t("round_details.info.no_info")}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="error.main">
                                {t("round_details.info.requirements")}
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: 1.8 }}>
                                {roundData.requirements || t("round_details.info.no_info")}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
};