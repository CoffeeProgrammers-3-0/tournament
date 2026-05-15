import {Avatar, Paper, Typography} from "@mui/material";
import type {ReactNode} from "react";

interface StepCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    color: string;
}

export const StepCard = ({ icon, title, description, color }: StepCardProps) => (
    <Paper
        elevation={0}
        sx={{
            p: 4,
            textAlign: "center",
            borderRadius: "32px", 
            border: "1px solid #f0f0f0",
            height: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
                transform: "translateY(-12px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                borderColor: color
            }
        }}
    >
        <Avatar
            sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 3,
                bgcolor: color,
                boxShadow: `0 8px 24px ${color}33`, 
                fontSize: "2rem"
            }}
        >
            {icon}
        </Avatar>
        <Typography variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.01em" }}>
            {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
        </Typography>
    </Paper>
);