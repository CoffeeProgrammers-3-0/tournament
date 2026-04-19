import {Box, Button, Chip, Paper, Stack, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {useTranslation} from "react-i18next";
import {toLocalInput} from "../../../../../utils/data.ts";
import {useRoundTimer} from "./useRoundTimer.ts";

interface RoundHeaderProps {
    roundData: any;
    isAdmin: boolean;
    isUser: boolean;
    submissionId?: number | null;
    onEdit: () => void;
    navigate: (path: string) => void;
}

export const RoundHeader = ({ roundData, isAdmin, isUser, submissionId, onEdit, navigate }: RoundHeaderProps) => {
    const { t } = useTranslation();
    const { timeLeft, urgencyColor } = useRoundTimer(roundData.endDate, roundData.status);

    return (
        <Paper
            sx={{
                p: 4, borderRadius: "24px", color: "white", mb: 4,
                background: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
            }}
        >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                    <Typography variant="h3" fontWeight={800}>{roundData.name}</Typography>
                    <Stack direction="row" spacing={2} mt={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                            label={t(`rounds.statuses.${roundData.status}`)}
                            sx={{ bgcolor: "white", color: "black", fontWeight: 700 }}
                        />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {toLocalInput(roundData.startDate)} — {toLocalInput(roundData.endDate)}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <TrophyIcon fontSize="small" /> {roundData.countOfWinners}
                        </Box>
                    </Stack>

                    {roundData.status === "ACTIVE" && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: urgencyColor }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: 'monospace' }}>
                                {timeLeft}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Stack direction="row" spacing={2}>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={onEdit}
                            sx={{ bgcolor: "white", color: "info.dark", borderRadius: "12px", "&:hover": { bgcolor: "#f0f0f0" } }}
                        >
                            {t("round_details.admin.edit_info")}
                        </Button>
                    )}
                    {isUser && roundData.status === "ACTIVE" && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/rounds/${roundData.id}/submission`)}
                            sx={{ borderRadius: "12px", fontWeight: 800 }}
                        >
                            {submissionId ? t("submission.status.edit") : t("round_details.submit_button")}
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
};