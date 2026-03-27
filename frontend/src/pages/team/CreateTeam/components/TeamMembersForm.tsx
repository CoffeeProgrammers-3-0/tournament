import {Box, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {useTranslation} from "react-i18next";

interface Props {
    users: any[];
    onChange: (idx: number, field: string, value: string) => void;
    onAdd: () => void;
    onRemove: (idx: number) => void;
}

export const TeamMembersForm = ({ users, onChange, onAdd, onRemove, limits }: Props & { limits: any }) => {
    const { t } = useTranslation();

    return (
        <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                    {t("team_create.team_members")}
                </Typography>
                <Divider />
            </Grid>

            {users.map((user, idx) => (
                <Grid size={{xs: 12}} key={idx}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <TextField
                            label={idx === 0 ? t("team_create.fields.leaders_name") : t("team_create.fields.members_name")}
                            fullWidth required
                            value={user.fullName}
                            onChange={e => onChange(idx, "fullName", e.target.value)}
                        />
                        <TextField
                            label={idx === 0 ? t("team_create.fields.leaders_email") : t("team_create.fields.members_email")}
                            type="email" fullWidth required
                            value={user.email}
                            onChange={e => onChange(idx, "email", e.target.value)}
                        />
                        <Box sx={{ display: "flex" }}>
                            <IconButton
                                color="error"
                                onClick={() => onRemove(idx)}
                                // Блокуємо видалення, якщо досягнуто мінімум
                                disabled={users.length <= limits.min}
                            >
                                <RemoveIcon />
                            </IconButton>

                            {idx === users.length - 1 && (
                                <IconButton
                                    color="primary"
                                    onClick={onAdd}
                                    // Приховуємо або блокуємо додавання, якщо досягнуто максимум
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