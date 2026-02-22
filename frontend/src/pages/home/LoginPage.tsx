import {Box, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

const LoginPage = () => {
    const { t } = useTranslation();

    return (
        <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
                {t("login.title")}
            </Typography>
        </Box>
    );
};

export default LoginPage;