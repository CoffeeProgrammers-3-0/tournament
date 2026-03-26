import {Box, Divider, Grid, Link, Paper, Typography} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";

export const SubmissionDetails = ({ submission, t }: any) => (
    <Paper sx={{ p: 4, borderRadius: "24px", mb: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>{submission.team.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary">{t('jury.round_label')}: {submission.round.name}</Typography>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 6}}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <GitHubIcon />
                    <Link href={submission.githubLink} target="_blank" fontWeight={600}>{t('jury.view_github')}</Link>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <YouTubeIcon color="error" />
                    <Link href={submission.videoLink} target="_blank" fontWeight={600}>{t('jury.view_video')}</Link>
                </Box>
            </Grid>
            <Grid size={{xs: 12}}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('jury.submission_desc')}</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", bgcolor: "#fafafa" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {submission.description || t('jury.no_description')}
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    </Paper>
);