import {Avatar, Box, Container, Grid, Paper, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const HomePage = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <HowToRegIcon fontSize="large" />,
            title: t("home.how_it_works.steps.step1.title"),
            description: t("home.how_it_works.steps.step1.desc"),
            color: "primary.main"
        },
        {
            icon: <GroupsIcon fontSize="large" />,
            title: t("home.how_it_works.steps.step2.title"),
            description: t("home.how_it_works.steps.step2.desc"),
            color: "secondary.main"
        },
        {
            icon: <EmojiEventsIcon fontSize="large" />,
            title: t("home.how_it_works.steps.step3.title"),
            description: t("home.how_it_works.steps.step3.desc"),
            color: "warning.main"
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ pt: 8, pb: 8 }}>
            {/* HERO SECTION */}
            <Box textAlign="center" sx={{ mb: 10 }}>
                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.02em" }}>
                    {t("home.title")}
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ maxWidth: "700px", mx: "auto", lineHeight: 1.6 }}>
                    {t("home.description")}
                </Typography>
            </Box>

            {/* HOW IT WORKS SECTION */}
            <Box>
                <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 6 }}>
                    {t("home.how_it_works.title")}
                </Typography>

                <Grid container spacing={4}>
                    {steps.map((step, index) => (
                        <Grid size={{xs: 12, md: 4}} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    textAlign: "center",
                                    borderRadius: "24px",
                                    border: "1px solid #f0f0f0",
                                    height: "100%",
                                    transition: "transform 0.3s",
                                    "&:hover": { transform: "translateY(-8px)" }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        mx: "auto",
                                        mb: 3,
                                        bgcolor: step.color,
                                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    {step.icon}
                                </Avatar>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {step.title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default HomePage;