import {Avatar, Box, Button, Paper, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";

export const TeamHeader = ({ team, canControl, onEdit }: { team: any, canControl: boolean, onEdit: () => void }) => (
    <Paper sx={{ p: 4, borderRadius: "24px", bgcolor: "secondary.main", color: "white", mb: 4, position: "relative", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: "white", color: "secondary.main", fontSize: "2rem", fontWeight: 800 }}>
                    {team.name.charAt(0)}
                </Avatar>
                <Box>
                    <Typography variant="h3" fontWeight={800}>{team.name}</Typography>
                    <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: 0.9 }}>
                            <CorporateFareIcon fontSize="small" /> {team.organization || "N/A"}
                        </Typography>
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: 0.9 }}>
                            <AlternateEmailIcon fontSize="small" /> {team.email}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            {canControl && (
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={onEdit}
                    sx={{ bgcolor: "white", color: "secondary.main", borderRadius: "12px", "&:hover": { bgcolor: "#eee" } }}
                >
                    Edit
                </Button>
            )}
        </Box>
    </Paper>
);