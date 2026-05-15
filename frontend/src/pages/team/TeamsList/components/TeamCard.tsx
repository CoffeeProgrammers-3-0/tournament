import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Typography
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import EmailIcon from "@mui/icons-material/Email";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

interface TeamCardProps {
    team: any;
    isAdmin: boolean;
    onDeleteClick: (id: number) => void;
}

export const TeamCard = ({ team, isAdmin, onDeleteClick }: TeamCardProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Card sx={{
            height: "100%", borderRadius: "24px", border: "1px solid", borderColor: "divider",
            transition: "all 0.3s ease", "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                        <GroupsIcon fontSize="large" />
                    </Avatar>
                    {isAdmin && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Chip label={`ID: ${team.id}`} size="small" variant="outlined" sx={{ borderRadius: "8px" }} />
                            <IconButton onClick={(e) => { e.stopPropagation(); onDeleteClick(team.id); }} color="error">
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>
                <Typography variant="h5" fontWeight={800}>{team.name}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 2, color: "text.secondary" }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" noWrap>{team.email}</Typography>
                </Box>
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 3 }}>
                <Button fullWidth onClick={() => navigate(`/teams/${team.id}`)} variant="text" sx={{ fontWeight: 700 }}>
                    {t("teams.card.more_info")}
                </Button>
            </CardActions>
        </Card>
    );
};