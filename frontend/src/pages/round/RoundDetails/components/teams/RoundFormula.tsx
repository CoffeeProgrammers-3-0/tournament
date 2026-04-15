import {alpha, Box, Grid, Paper, Stack, Typography, useTheme} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalculateIcon from '@mui/icons-material/Calculate';

export const RoundFormula = ({ t }: { t: any }) => {
    const theme = useTheme();

    // Спільний стиль для карток формул
    const cardStyle = {
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start' // Вирівнювання по верхньому/лівому краю
    };

    const labelStyle = {
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: 800,
        color: 'text.secondary',
        fontSize: '0.7rem'
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                mb: 4,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.03)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <InfoOutlinedIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={800} color="primary.dark">
                    {t("round_details.teams.calculation_logic", "ЛОГІКА РОЗРАХУНКУ БАЛІВ")}
                </Typography>
            </Stack>

            <Grid container spacing={3}>
                {/* 1. TOTAL TEAM SCORE */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={cardStyle}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                            <FunctionsIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                            <Typography variant="caption" sx={labelStyle}>
                                {t("round_details.teams.formula.total_score_title", "Загальний бал команди")}
                            </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={500} sx={{ mr: 2, color: 'text.disabled' }}>=</Typography>

                            {/* Математичний дріб, вирівняний по лівому краю */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={800}
                                    color="primary.main"
                                    sx={{
                                        borderBottom: '1.5px solid',
                                        borderColor: 'primary.main',
                                        pb: 0.5,
                                        px: 1,
                                        width: '100%',
                                        textAlign: 'center'
                                    }}
                                >
                                    Σ {t("round_details.teams.formula.jury_scores_sum", "Бали журі")}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ pt: 0.5 }}>
                                    {t("round_details.teams.formula.juries_count", "Кількість оцінок")}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                {/* 2. INDIVIDUAL JURY SCORE */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={cardStyle}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                            <CalculateIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                            <Typography variant="caption" sx={labelStyle}>
                                {t("round_details.teams.formula.jury_score_title", "Розрахунок бала журі")}
                            </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={500} sx={{ mr: 2, color: 'text.disabled' }}>=</Typography>

                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color="primary.main"
                                >
                                    Σ
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                        {t("round_details.teams.formula.category_avg", "Сер. бал")}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mx: 1, color: 'primary.main', fontWeight: 800 }}>
                                        ×
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700} color="primary.main">
                                        {t("round_details.teams.formula.weight", "Вага")}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};