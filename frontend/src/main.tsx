import {StrictMode} from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import {ThemeProvider} from "@mui/material/styles";
import {CssBaseline, StyledEngineProvider} from "@mui/material";

import {theme} from "./themes/muiTheme";
import "./styles/tokens.css";
import "./styles/global.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </StyledEngineProvider>
    </StrictMode>
);