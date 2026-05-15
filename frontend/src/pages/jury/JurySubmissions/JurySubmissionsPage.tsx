import {Alert, Avatar, Box, CircularProgress, Container, Grid, Typography} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {useJurySubmissions} from "./useJurySubmissions";
import {SubmissionCard} from "./components/SubmissionCard";

export const JurySubmissionsPage = () => {
    const { submissions, loading, error, t } = useJurySubmissions();

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress thickness={5} size={50} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ pb: 6, pt: 1 }}>
            {/* Header Section */}
            <Box sx={{ mb: 6, display: "flex", alignItems: "center", gap: 3 }}>
                <Avatar sx={{
                    bgcolor: "primary.50",
                    color: "primary.main",
                    width: 70,
                    height: 70,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}>
                    <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                    <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ letterSpacing: "-0.02em" }}>
                        {t('jury.submissions_title')}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ opacity: 0.8 }}>
                        {t('jury.submissions_subtitle')}
                    </Typography>
                </Box>
            </Box>

            {/* Notifications */}
            {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: "16px", fontWeight: 600 }}>
                    {error}
                </Alert>
            ) }

            {/* Grid Content */}
            {!error && submissions.length === 0 ? (
                <Box sx={{
                    textAlign: "center",
                    py: 12,
                    bgcolor: "action.hover",
                    borderRadius: "40px",
                    border: "2px dashed",
                    borderColor: "divider"
                }}>
                    <Typography variant="h5" color="text.secondary" fontWeight={600}>
                        {t('jury.no_submissions')}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {submissions.map((submission) => (
                        <Grid size={{ xs: 12, md: 6 }} key={submission.id}>
                            <SubmissionCard submission={submission} t={t} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};