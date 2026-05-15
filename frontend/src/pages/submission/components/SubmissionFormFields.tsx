import {Box, Grid, TextField} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import DescriptionIcon from "@mui/icons-material/Description";

interface Props {
    formData: any;
    isLocked: boolean;
    actionLoading: boolean;
    onChange: (e: any) => void;
    t: any;
}

export const SubmissionFormFields = ({ formData, isLocked, actionLoading, onChange, t }: Props) => (
    <Grid container spacing={4}>
        <Grid size={{xs:12}}>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                <GitHubIcon color={isLocked ? "disabled" : "action"} sx={{ mb: 1.5 }} />
                <TextField
                    label={t('submission.fields.github')}
                    name="githubLink"
                    fullWidth required
                    value={formData.githubLink}
                    onChange={onChange}
                    disabled={actionLoading || isLocked}
                    variant="standard"
                />
            </Box>
        </Grid>
        <Grid size={{xs:12}}>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                <YouTubeIcon color={isLocked ? "disabled" : "action"} sx={{ mb: 1.5 }} />
                <TextField
                    label={t('submission.fields.video')}
                    name="videoLink"
                    fullWidth required
                    value={formData.videoLink}
                    onChange={onChange}
                    disabled={actionLoading || isLocked}
                    variant="standard"
                />
            </Box>
        </Grid>
        <Grid size={{xs:12}}>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <DescriptionIcon color={isLocked ? "disabled" : "action"} sx={{ mt: 2 }} />
                <TextField
                    label={t('submission.fields.description')}
                    name="description"
                    multiline rows={4} fullWidth
                    value={formData.description}
                    onChange={onChange}
                    disabled={actionLoading || isLocked}
                />
            </Box>
        </Grid>
    </Grid>
);