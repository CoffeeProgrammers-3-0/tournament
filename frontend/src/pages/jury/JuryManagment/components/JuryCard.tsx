import {useState} from "react";
import {Avatar, Box, Card, Chip, IconButton, TextField, Tooltip, Typography} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export const JuryCard = ({ jury, onUpdate, onDelete, t }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(jury.fullName);

    const initials = jury.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase();

    const handleSave = async () => {
        const success = await onUpdate(jury.id, newName);
        if (success) setIsEditing(false);
    };

    const handleCancel = () => {
        setNewName(jury.fullName);
        setIsEditing(false);
    };

    return (
        <Card sx={{
            borderRadius: "24px", border: "1px solid #eee", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", p: 3, transition: "all 0.3s ease", position: "relative",
            "&:hover": { transform: "translateY(-8px)", boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }
        }}>
            {/* Action Buttons */}
            <Box sx={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 0.5 }}>
                {!isEditing ? (
                    <>
                        <Tooltip title={t("common.edit")}>
                            <IconButton size="small" onClick={() => setIsEditing(true)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t("common.delete")}>
                            <IconButton size="small" color="error" onClick={() => onDelete(jury.id, jury.fullName)}>
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" color="success" onClick={handleSave}>
                            <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="inherit" onClick={handleCancel}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Avatar sx={{ width: 70, height: 70, mb: 2, bgcolor: "secondary.light", color: "secondary.dark", fontWeight: 700 }}>
                {initials}
            </Avatar>

            {/* Inline Name Field */}
            <Box sx={{ width: '100%', mb: 1, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isEditing ? (
                    <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        value={newName}
                        autoFocus
                        onChange={(e) => setNewName(e.target.value)}
                        sx={{ input: { textAlign: 'center', fontWeight: 800, fontSize: '1.25rem' } }}
                    />
                ) : (
                    <Typography variant="h6" fontWeight={800} noWrap>{jury.fullName}</Typography>
                )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, color: "text.secondary" }}>
                <EmailIcon fontSize="inherit" />
                <Typography variant="body2" noWrap>{jury.email}</Typography>
            </Box>

            <Chip icon={<GavelIcon fontSize="small" />} label="JURY" size="small" sx={{ fontWeight: 700, borderRadius: "8px" }} />
        </Card>
    );
};