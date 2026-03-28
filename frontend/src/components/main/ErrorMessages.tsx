import {Alert, AlertTitle} from "@mui/material";

export const ErrorMessages = ({ errors }: { errors: string[] }) => {
    if (!errors || errors.length === 0) return null;

    return (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "16px" }}>
            <AlertTitle sx={{ fontWeight: 700 }}>Виправте наступні помилки:</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {errors.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
        </Alert>
    );
};