import {Box, Button, Card, CardContent, Chip, Typography} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {useNavigate} from "react-router-dom";

interface SubmissionCardProps {
    submission: any;
    t: any;
}

export const SubmissionCard = ({ submission, t }: SubmissionCardProps) => {
    const navigate = useNavigate();

    return (
        <Card sx={{
            height: "100%",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                borderColor: "primary.light"
            }
        }}>
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        {submission.team.name}
                    </Typography>
                    <Chip
                        label={submission.round.name}
                        color="secondary"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, borderRadius: "8px" }}
                    />
                </Box>

                <Box sx={{ mt: "auto" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/jury/evaluate/${submission.id}`)}
                        sx={{
                            borderRadius: "12px",
                            fontWeight: 700,
                            py: 1.2,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": { boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)" }
                        }}
                    >
                        {t('jury.actions.evaluate')}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};