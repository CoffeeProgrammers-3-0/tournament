import {Avatar, Box, Card, Chip, IconButton, Tooltip, Typography} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";

export const JuryCard = ({ jury, onEdit, onDelete, t }: any) => {
    const initials = jury.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase();

    return (
        <Card sx={{
            borderRadius: "24px", border: "1px solid #eee", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", p: 3, transition: "all 0.3s ease", position: "relative",
            "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }
        }}>
            <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 0.5 }}>
                <Tooltip title={t("common.edit")}>
                    <IconButton size="small" onClick={() => onEdit(jury)}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
                <Tooltip title={t("common.delete")}>
                    <IconButton size="small" color="error" onClick={() => onDelete(jury.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
            </Box>

            <Avatar sx={{ width: 70, height: 70, mb: 2, bgcolor: "secondary.light", color: "secondary.dark", fontWeight: 700 }}>
                {initials}
            </Avatar>

            <Typography variant="h6" fontWeight={800} noWrap sx={{ width: '100%' }}>{jury.fullName}</Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, color: "text.secondary" }}>
                <EmailIcon fontSize="inherit" />
                <Typography variant="body2" noWrap>{jury.email}</Typography>
            </Box>

            <Chip icon={<GavelIcon fontSize="small" />} label="JURY" size="small" sx={{ fontWeight: 700, borderRadius: "8px" }} />
        </Card>
    );
};