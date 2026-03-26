import {Box, Button, Chip, Paper, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import {useTranslation} from "react-i18next";
import type {RoundFullResponseDto} from "../../../../entities/round/round.dto";

type Props = {
    roundData: RoundFullResponseDto;
    isAdmin: boolean;
    isEditingInfo: boolean;
    onEdit: () => void;
};

export const RoundHeader = ({ roundData, isAdmin, isEditingInfo, onEdit }: Props) => {
    const { t } = useTranslation();

    return (
        <Paper
            sx={{
                p: 4,
                borderRadius: "24px",
                bgcolor: "info.dark",
                color: "white",
                mb: 4,
                background: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                    <Typography variant="h3" fontWeight={800}>{roundData.name}</Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: 1, alignItems: "center", flexWrap: "wrap" }}>
                        <Chip
                            label={t(`rounds.statuses.${roundData.status}`)}
                            sx={{
                                bgcolor: roundData.status === "ACTIVE" ? "success.main" : "white",
                                color: roundData.status === "ACTIVE" ? "white" : "black",
                                fontWeight: 700,
                            }}
                            size="small"
                        />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {t("round_details.header.dates")} {roundData.startDate} — {roundData.endDate}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 0.5 }}>
                            <TrophyIcon fontSize="small" /> {t("round_details.header.winners")} {roundData.countOfWinners}
                        </Typography>
                    </Box>
                </Box>

                {isAdmin && !isEditingInfo && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={onEdit}
                        sx={{
                            borderRadius: "12px",
                            fontWeight: 700,
                            bgcolor: "white",
                            color: "info.dark",
                            "&:hover": { bgcolor: "#f0f0f0" },
                        }}
                    >
                        {t("round_details.admin.edit_info")}
                    </Button>
                )}
            </Box>
        </Paper>
    );
};