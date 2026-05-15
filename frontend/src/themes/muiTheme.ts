import {createTheme} from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#0e3f57",
        },
        secondary: {
            main: "#ffc400",
        },
        error: {
            main: "#c62828",
        },
        background: {
            default: "#f4f6f5",
            paper: "#ffffff",
        },
        text: {
            primary: "#1c1c1c",
            secondary: "#6b7280",
        },
    },

    shape: {
        borderRadius: 12, // Corresponds to your --radius-md
    },

    typography: {
        fontFamily: '"Inter", system-ui, sans-serif',
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20, // Replaced --radius-lg
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)", // Replaced --shadow-sm
                },
            },
        },
    },
});