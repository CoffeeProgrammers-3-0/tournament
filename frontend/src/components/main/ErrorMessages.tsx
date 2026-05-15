import {Alert, AlertTitle} from "@mui/material";
import {useTranslation} from "react-i18next";

interface ErrorMessagesProps {
    errors: string[];
    onClear?: () => void;
}

export const ErrorMessages = ({ errors, onClear }: ErrorMessagesProps) => {
    const { t } = useTranslation();

    if (!errors || errors.length === 0) return null;

    return (
        <Alert
            severity="error"
            onClose={onClear}
            sx={{
                mb: 3,
                borderRadius: "16px",
                "& .MuiAlert-message": { width: "100%" }
            }}
        >
            <AlertTitle sx={{ fontWeight: 700 }}>{t("common.errors")}</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {errors.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </Alert>
    );
};