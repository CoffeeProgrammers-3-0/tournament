import {Box, Button, Container, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import errorImage from "../../assets/404.svg"; // Переконайтеся, що шлях правильний

export const Error404Page = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", py: 10 }}>
            <Box
                component="img"
                src={errorImage}
                alt="404 Not Found"
                sx={{ width: "100%", maxWidth: 400, mb: 4 }}
            />
            <Typography variant="h4" fontWeight={700} gutterBottom>
                {t("errors.404.title") || "Oops! Page not found."}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t("errors.404.description") || "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}>
                {t("common.goHome") || "Go to Homepage"}
            </Button>
        </Container>
    );
};