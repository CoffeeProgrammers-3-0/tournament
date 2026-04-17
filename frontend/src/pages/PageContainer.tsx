import {type ReactNode} from "react";
import {Box, Container} from "@mui/material";
import {AppHeader} from "../components/main/AppHeader";
import {AppFooter} from "../components/main/AppFooter";
import {NotificationProvider} from "../context/NotificationContext"; // ДОДАНО

interface PageContainerProps {
    children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
    return (
        <NotificationProvider>
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
                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        {children}
                    </Container>
                </Box>

                <AppFooter />
            </Box>
        </NotificationProvider>
    );
};

export default PageContainer;