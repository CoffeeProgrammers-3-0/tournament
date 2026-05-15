import {Box, Typography} from "@mui/material";
import {useEffect} from "react";
import {useTranslation} from "react-i18next";
import AuthService from "../../../services/auth/AuthService.ts";

const LoginPage = () => {
    const { t } = useTranslation();

    useEffect(() => {
        
        AuthService.redirectToKeycloak();
    }, []);

    return (
        <Box textAlign="center">
            <Typography variant="body1" color="text.secondary">
                {t("login.title")}
            </Typography>
        </Box>
    );
};

export default LoginPage;