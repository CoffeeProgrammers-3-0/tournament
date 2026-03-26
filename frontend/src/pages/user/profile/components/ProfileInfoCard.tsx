import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import {useTranslation} from "react-i18next";

interface ProfileInfoCardProps {
    user: any;
    isEditing: boolean;
    editName: string;
    isSaving: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onNameChange: (val: string) => void;
}

export const ProfileInfoCard = ({ user, isEditing, editName, isSaving, onEdit, onSave, onCancel, onNameChange }: ProfileInfoCardProps) => {
    const { t } = useTranslation();
    const initials = user.fullName?.charAt(0).toUpperCase() || "?";

    return (
        <Card sx={{ borderRadius: "20px", textAlign: "center", p: 2, height: "100%" }}>
            <CardContent>
                <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: "2.5rem" }}>
                    {initials}
                </Avatar>

                {isEditing ? (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label={t("profile.fields.full_name")}
                            value={editName}
                            onChange={(e) => onNameChange(e.target.value)}
                            sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Button
                                variant="contained"
                                onClick={onSave}
                                disabled={isSaving}
                                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            >
                                {t("common.save")}
                            </Button>
                            <IconButton onClick={onCancel} disabled={isSaving}>
                                <CloseIcon color="error" />
                            </IconButton>
                        </Box>
                    </Box>
                ) : (
                    <>
                        <Typography variant="h5" fontWeight={700}>{user.fullName}</Typography>
                        <Chip label={user.role} color="secondary" size="small" sx={{ mt: 1, fontWeight: 700, px: 1 }} />
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 4, borderRadius: "10px", textTransform: "none" }}
                            onClick={onEdit}
                        >
                            {t("profile.buttons.edit")}
                        </Button>
                    </>
                )}

                <Box sx={{ mt: 4, textAlign: "left" }}>
                    <InfoRow icon={<EmailIcon />} label="Email" value={user.email} />
                    <InfoRow icon={<VerifiedUserIcon />} label={t("profile.role")} value={user.role} />
                </Box>
            </CardContent>
        </Card>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ mr: 2, color: "text.secondary" }}>{icon}</Box>
        <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1" fontWeight={500}>{value}</Typography>
        </Box>
    </Box>
);