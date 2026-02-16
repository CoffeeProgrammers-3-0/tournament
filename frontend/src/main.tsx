import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./themes/ThemeContext";
import "./themes/global.css";
import "./i18n";
import { StyledEngineProvider, CssBaseline } from "@mui/material";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <StyledEngineProvider injectFirst>
            <ThemeProvider>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </StyledEngineProvider>
    </StrictMode>
);
