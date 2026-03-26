import {Avatar, Box, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

export const ProfileTeamsList = ({ teams }: { teams: any[] }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Paper sx={{ borderRadius: "20px", p: 3, height: "100%", border: "1px solid #f0f0f0" }} elevation={0}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <GroupsIcon sx={{ mr: 1.5, color: "primary.main" }} />
                <Typography variant="h6" fontWeight={700}>{t("profile.teams")}</Typography>
            </Box>
            <List disablePadding>
                {teams.map((team, index) => (
                    <Box key={team.id}>
                        <ListItem
                            onClick={() => navigate(`/teams/${team.id}`)}
                            sx={{ px: 1, py: 1.5, borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" } }}
                            secondaryAction={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "grey.100", color: "text.primary" }}>{team.name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={team.name} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItem>
                        {index < teams.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                    </Box>
                ))}
            </List>
            {teams.length === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>{t("profile.no_teams")}</Typography>
            )}
        </Paper>
    );
};