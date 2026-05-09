import {type ReactNode} from "react";
import {Box, Container, IconButton, Tooltip} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useLocation, useNavigate} from "react-router-dom";
import {AppHeader} from "../components/main/AppHeader";
import {AppFooter} from "../components/main/AppFooter";
import {useTranslation} from "react-i18next";

interface PageContainerProps {
    children: ReactNode;
    showBackButton?: boolean;
}

const PageContainer = ({ children, showBackButton = true }: PageContainerProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();


    const isHomePage = location.pathname === "/";
    const shouldShowBack = showBackButton && !isHomePage;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
            }}
        >
            <AppHeader />

            <Box component="main" sx={{ flex: 1 }}>
                <Container maxWidth="lg" sx={{ py: 2, pb: 4, position: "relative" }}>

                    {shouldShowBack && (
                        <Tooltip title={t("common.back") || "Back"}>
                            <IconButton
                                onClick={() => navigate(-1)}
                                sx={{
                                    bgcolor: "background.paper",
                                    boxShadow: 1,
                                    "&:hover": { bgcolor: "action.hover" }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {children}
                </Container>
            </Box>

            <AppFooter />
        </Box>
    );
};

export default PageContainer;