import {Box, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {useTranslation} from "react-i18next";

interface Props {
    users: any[];
    onChange: (idx: number, field: string, value: string) => void;
    onAdd: () => void;
    onRemove: (idx: number) => void;
    limits: { min: number, max: number };
    isReadOnlyFirst?: boolean;
}

export const TeamMembersForm = ({ users, onChange, onAdd, onRemove, limits, isReadOnlyFirst }: Props) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
                    {t("team_create.team_members")}
                </Typography>
                <Divider />
            </Grid>

            {users.map((user, idx) => (
                <Grid size={{ xs: 12 }} key={idx}>
                    <Box sx={{
                        display: "flex", gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                        p: 2, borderRadius: "16px",
                        bgcolor: idx === 0 ? "rgba(0,0,0,0.03)" : "transparent"
                    }}>
                        <TextField
                            label={idx === 0 ? t("team_create.fields.leaders_name") : t("team_create.fields.members_name")}
                            fullWidth required
                            disabled={idx === 0 && isReadOnlyFirst}
                            value={user.fullName}
                            onChange={e => onChange(idx, "fullName", e.target.value)}
                        />
                        <TextField
                            label={idx === 0 ? t("team_create.fields.leaders_email") : t("team_create.fields.members_email")}
                            type="email" fullWidth required
                            disabled={idx === 0 && isReadOnlyFirst}
                            value={user.email}
                            onChange={e => onChange(idx, "email", e.target.value)}
                        />
                        <Box sx={{ display: "flex", alignSelf: "center" }}>
                            <IconButton
                                color="error"
                                onClick={() => onRemove(idx)}
                                disabled={users.length <= limits.min || idx === 0}
                            >
                                <RemoveIcon />
                            </IconButton>
                            {idx === users.length - 1 && (
                                <IconButton
                                    color="primary"
                                    onClick={onAdd}
                                    disabled={users.length >= limits.max}
                                >
                                    <AddIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};