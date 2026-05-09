import {
    alpha,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
    useTheme
} from "@mui/material";
import {useNavigate} from "react-router-dom"; // Додаємо навігацію
import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {useJurySubmissions} from "../../../jury/JurySubmissions/useJurySubmissions";

export const ProfileJurySubmissionsList = () => {
    const { submissions, loading, error, t } = useJurySubmissions();
    const theme = useTheme();
    const navigate = useNavigate();

    if (loading) return (
        <Card sx={{ borderRadius: "20px", display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} />
        </Card>
    );

    return (
        <Card sx={{ borderRadius: "20px", height: "100%", display: 'flex', flexDirection: 'column' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        <PendingActionsIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={800}>
                        {t("profile.jury.submissions_title", "Роботи для оцінювання")}
                    </Typography>
                </Box>

                {error ? (
                    <Typography color="error" variant="body2">{error}</Typography>
                ) : submissions.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        {t("profile.jury.no_submissions", "Наразі немає робіт для перевірки")}
                    </Typography>
                ) : (
                    <List disablePadding>
                        {submissions.map((submission, index) => (
                            <Box key={submission.id}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate(`/jury/evaluate/${submission.id}`)}
                                        sx={{
                                            px: 0,
                                            py: 1.5,
                                            borderRadius: '12px',
                                            transition: '0.2s',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                    >
                                        <ListItemAvatar sx={{ ml: 1 }}>
                                            <Avatar sx={{ bgcolor: 'grey.100', color: 'grey.600' }}>
                                                <AssignmentIcon fontSize="small" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography fontWeight={700} variant="body2">
                                                    {submission.team?.name || t("common.team")}
                                                </Typography>
                                            }
                                            secondary={submission.round?.name}
                                        />
                                        <Chip
                                            label={submission.round?.status === 'EVALUATED' ? t("jury.status.evaluated") : t("jury.status.pending")}
                                            size="small"
                                            icon={submission.round?.status === 'EVALUATED' ? <CheckCircleOutlineIcon /> : <PendingActionsIcon />}
                                            color={submission.round?.status === 'EVALUATED' ? "success" : "warning"}
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.65rem',
                                                mr: 1,
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                {index < submissions.length - 1 && <Divider component="li" />}
                            </Box>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};