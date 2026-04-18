import {type ReactNode} from "react";
import {Box, Container} from "@mui/material";
import {AppHeader} from "../components/main/AppHeader";
import {AppFooter} from "../components/main/AppFooter";

interface PageContainerProps {
    children: ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
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
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {children}
                </Container>
            </Box>

            <AppFooter />
        </Box>
    );
};

export default PageContainer;