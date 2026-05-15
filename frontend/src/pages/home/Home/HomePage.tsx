import {Box, Container, Grid, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {StepCard} from "./components/StepCard";
import {getHomeSteps} from "./constants/homeSteps";

export const HomePage = () => {
    const {t} = useTranslation();
    const steps = getHomeSteps(t);

    return (
        <Container maxWidth="lg" sx={{pt: 1, pb: 12}}>
            <Box textAlign="center" sx={{mb: 12}}>
                <Typography
                    variant="h1"
                    fontWeight={900}
                    gutterBottom
                    sx={{
                        letterSpacing: "-0.04em",
                        fontSize: {xs: "3rem", md: "4.5rem"},
                        background: "linear-gradient(45deg, #1a237e, #3949ab)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    {t("home.title")}
                </Typography>
                <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{maxWidth: "750px", mx: "auto", lineHeight: 1.7, fontWeight: 400, opacity: 0.9}}
                >
                    {t("home.description")}
                </Typography>
            </Box>

            <Box>
                <Typography
                    variant="h3"
                    fontWeight={800}
                    textAlign="center"
                    sx={{mb: 8, letterSpacing: "-0.02em"}}
                >
                    {t("home.how_it_works.title")}
                </Typography>

                <Grid container spacing={4}>
                    {steps.map((step, index) => (
                        <Grid size={{xs: 12, md: 6}} key={index}>
                            <StepCard
                                icon={step.icon}
                                title={step.title}
                                description={step.description}
                                color={step.color}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default HomePage;