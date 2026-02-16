import { type ReactNode } from "react";
import { Box } from "@mui/material";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

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
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
            }}
        >
            <Header />
            <Box
                component="main"
                className="main"
                sx={{ flex: 1 }}
            >
                <Box className="main-content">
                    {children}
                </Box>
            </Box>
            <Footer />
        </Box>
    );
};

export default PageContainer;
