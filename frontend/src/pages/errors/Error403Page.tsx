import {Box, Button, Container, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import errorImage from "../../assets/403.svg";

export const Error403Page = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", py: 10 }}>
            <Box
                component="img"
                src={errorImage}
                alt="403 Forbiden"
                sx={{ width: "100%", maxWidth: 400, mb: 4 }}
            />
            <Typography variant="h5" fontWeight={600} gutterBottom>
                {t("errors.403.title") || "Access Denied"}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t("errors.403.description") || "You do not have permission to view this page."}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}>
                {t("common.goHome") || "Go to Homepage"}
            </Button>
        </Container>
    );
};