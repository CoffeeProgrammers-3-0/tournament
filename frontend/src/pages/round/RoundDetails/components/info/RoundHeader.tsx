import {useEffect, useState} from "react";
import {Box, Button, Chip, Paper, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // New Icon
import HowToRegIcon from "@mui/icons-material/HowToReg";
import DeleteIcon from "@mui/icons-material/Delete";
import {useTranslation} from "react-i18next";
import type {RoundFullResponseDto} from "../../../../../entities/round/round.dto";
import {ErrorMessages} from "../../../../../components/main/ErrorMessages.tsx";

type Props = {
    roundData: RoundFullResponseDto;
    isAdmin: boolean;
    isEditingInfo: boolean;
    onEdit: () => void;
    isUser: boolean;
    navigate: (path: string) => void;
    submissionId: number | null;
    onDelete?: () => void;
    errors: string[];
};

export const RoundHeader = ({
                                roundData,
                                isAdmin,
                                isUser,
                                isEditingInfo,
                                onEdit,
                                navigate,
                                submissionId,
                                onDelete,
    errors
                            }: Props) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [urgencyColor, setUrgencyColor] = useState<string>("white");

    // Timer Logic
    useEffect(() => {
        if (roundData.status !== "ACTIVE") return;

        const updateTimer = () => {
            const end = new Date(roundData.endDate).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft(t("round_details.header.expired"));
                setUrgencyColor("#ff5252"); // Red
                return;
            }

            // Calculate parts
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Color Logic
            if (diff < 3600000) { // Less than 1 hour
                setUrgencyColor("#ff5252"); // Bright Red
            } else if (diff < 86400000) { // Less than 24 hours
                setUrgencyColor("#ffb74d"); // Warning Orange
            } else {
                setUrgencyColor("white");
            }

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call

        return () => clearInterval(timer);
    }, [roundData.endDate, roundData.status, t]);

    const handleSubmissionClick = () => {
        if (submissionId && submissionId > 0) {
            navigate(`/rounds/${roundData.id}/submission/${submissionId}`);
        } else {
            navigate(`/rounds/${roundData.id}/submission/`);
        }
    };

    return (
        <Paper
            sx={{
                p: 4,
                borderRadius: "24px",
                bgcolor: "info.dark",
                color: "white",
                mb: 4,
                background: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <ErrorMessages errors={errors}/>
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
                            {roundData.startDate.substring(0, 16).replace("T", " ")} — {roundData.endDate.substring(0, 16).replace("T", " ")}
                        </Typography>

                        <Typography variant="body2" sx={{ opacity: 0.9, display: "flex", alignItems: "center", gap: 0.5 }}>
                            <TrophyIcon fontSize="small" /> {t("round_details.header.winners")} {roundData.countOfWinners}
                        </Typography>
                    </Box>

                    {/* REAL-TIME TIMER */}
                    {roundData.status === "ACTIVE" && (
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: "rgba(0,0,0,0.2)",
                            px: 1.5,
                            py: 0.5,
                            mt: 2,
                            borderRadius: "8px",
                            border: `1px solid ${urgencyColor}`,
                            transition: "all 0.3s ease",
                        }}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: urgencyColor }} />
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    color: urgencyColor,
                                    fontWeight: 800,
                                    fontFamily: "monospace", // Keeps numbers from jumping
                                    fontSize: "1rem"
                                }}
                            >
                                {timeLeft}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    {isAdmin && roundData.status === "DRAFT" && !isEditingInfo && (
                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={onDelete}
                            sx={{
                                borderRadius: "12px",
                                fontWeight: 700,
                                color: "white",
                                borderColor: "rgba(255,255,255,0.5)",
                                "&:hover": {
                                    bgcolor: "error.main",
                                    borderColor: "error.main",
                                    color: "white"
                                },
                            }}
                        >
                            {t("common.delete")}
                        </Button>
                    )}

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

                    {roundData.status === "ACTIVE" && isUser && (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<HowToRegIcon />}
                            onClick={handleSubmissionClick}
                            sx={{
                                borderRadius: "16px",
                                fontWeight: 800,
                                px: 4,
                                py: 2,
                                color: "black",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 24px rgba(0,0,0,0.4)" },
                                transition: "all 0.2s"
                            }}
                        >
                            {submissionId && submissionId > 0
                                ? t("submission.status.edit")
                                : t("round_details.submit_button")}
                        </Button>
                    )}
                    {roundData.status === "EVALUATED" || roundData.status === "SUBMISSION_CLOSED"
                    && submissionId && submissionId > 0 && isUser && (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<HowToRegIcon />}
                            onClick={handleSubmissionClick}
                            sx={{
                                borderRadius: "16px",
                                fontWeight: 800,
                                px: 4,
                                py: 2,
                                color: "black",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 12px 24px rgba(0,0,0,0.4)" },
                                transition: "all 0.2s"
                            }}
                        >
                            {t("submission.status.submitted")}
                        </Button>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};